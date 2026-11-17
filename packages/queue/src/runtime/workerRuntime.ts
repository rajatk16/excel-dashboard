import type { WorkerEnvironment } from '../config/workerEnvironment';
import {
  type ProbeJobProcessor,
  QueueConsumer,
} from '../consumers/queueConsumer';
import type { ActiveJobName } from '../contracts/jobContract';
import type { ActiveQueueName } from '../contracts/queueName';
import { QueueHealth } from '../monitoring/queueHealth';

import { WorkerHealthServer } from './workerHealthServer';
import { createWorkerLogger } from './workerLogger';

export interface WorkerRuntimeOptions {
  environment: WorkerEnvironment;

  queueName: ActiveQueueName;

  jobName: ActiveJobName;

  processor: ProbeJobProcessor;
}

export interface WorkerRuntime {
  start(): Promise<void>;

  stop(): Promise<void>;
}

export function createWorkerRuntime(
  options: WorkerRuntimeOptions,
): WorkerRuntime {
  const { environment, queueName, jobName } = options;

  const logger = createWorkerLogger(
    environment.WORKER_NAME,
  );

  let stopping = false;

  let started = false;

  let stopPromise: Promise<void> | undefined;

  const health = new QueueHealth(
    environment,

    environment.WORKER_NAME,
  );

  const consumer = new QueueConsumer({
    environment,

    queueName,

    jobName,

    processor: options.processor,

    onError: () => {
      logger.error('Worker or Redis operation failed.', {
        queueName,
      });
    },

    onCompleted: (jobId) => {
      logger.info('Job completed.', {
        queueName,

        jobId,
      });
    },

    onFailed: (jobId, attemptsMade) => {
      logger.warn('Job attempt failed.', {
        queueName,

        jobId,

        attemptsMade,
      });
    },

    onStalled: (jobId) => {
      logger.warn('Job stalled.', {
        queueName,

        jobId,
      });
    },
  });

  const healthServer = new WorkerHealthServer({
    host: environment.WORKER_HEALTH_HOST,

    port: environment.WORKER_HEALTH_PORT,

    isReady: async () => {
      if (
        !started ||
        stopping ||
        !consumer.isReady()
      ) {
        return false;
      }

      const result = await health.check();

      return (
        !stopping &&
        consumer.isReady() &&
        result.status === 'up'
      );
    },
  });

  async function dispose(): Promise<void> {
    stopping = true;

    logger.info('Worker shutdown started.');

    try {
      // Stop accepting new jobs and wait for active jobs.
      await consumer.close();
    } finally {
      try {
        await health.close();
      } finally {
        await healthServer.close();
      }
    }

    logger.info('Worker shutdown completed.');
  }

  return {
    async start(): Promise<void> {
      if (started || stopping) {
        throw new Error('Worker runtime cannot be started.');
      }

      try {
        await healthServer.start();

        await health.connect();

        await consumer.start();

        started = true;

        logger.info('Worker started.', {
          queueName,

          concurrency: environment.WORKER_CONCURRENCY,

          healthPort: environment.WORKER_HEALTH_PORT,
        });
      } catch (error) {
        stopPromise ??= dispose();

        await stopPromise.catch(() => undefined);

        throw error;
      }
    },

    stop(): Promise<void> {
      stopping = true;

      stopPromise ??= dispose();

      return stopPromise;
    },
  };
}

export async function runWorkerProcess(
  options: WorkerRuntimeOptions,
): Promise<void> {
  const logger = createWorkerLogger(
    options.environment.WORKER_NAME,
  );

  const runtime = createWorkerRuntime(options);

  let shuttingDown = false;

  const shutdown = (signal: string): void => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    logger.info('Shutdown signal received.', {
      signal,
    });

    const timer = setTimeout(() => {
      logger.error('Worker shutdown deadline exceeded.');

      // Last-resort termination. BullMQ may recover the
      // interrupted job through its stalled-job mechanism.
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }, options.environment.QUEUE_SHUTDOWN_TIMEOUT_MS);

    void runtime
      .stop()
      .then(() => {
        process.exitCode = 0;
      })
      .catch(() => {
        logger.error('Worker shutdown failed.');

        process.exitCode = 1;
      })
      .finally(() => {
        clearTimeout(timer);

        process.removeListener('SIGTERM', onSigterm);

        process.removeListener('SIGINT', onSigint);
      });
  };

  const onSigterm = (): void => {
    shutdown('SIGTERM');
  };

  const onSigint = (): void => {
    shutdown('SIGINT');
  };

  process.once('SIGTERM', onSigterm);

  process.once('SIGINT', onSigint);

  // Bound startup as well as shutdown. BullMQ workers may
  // otherwise continue reconnecting while Redis is unavailable.
  const startupTimer = setTimeout(() => {
    logger.error('Worker startup deadline exceeded.');

    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }, options.environment.QUEUE_SHUTDOWN_TIMEOUT_MS);

  try {
    await runtime.start();
  } catch (error) {
    process.removeListener('SIGTERM', onSigterm);

    process.removeListener('SIGINT', onSigint);

    throw error;
  } finally {
    clearTimeout(startupTimer);
  }
}
