import { Queue } from 'bullmq';
import type Redis from 'ioredis';

import type { QueueEnvironment } from '../config/queueEnvironment';
import {
  closeRedis,
  connectRedis,
  createRedisConnection,
} from '../connections/redisConnection';
import {
  ACTIVE_JOB_QUEUE_MAP,
  type ActiveJobName,
  type ProbeJobPayload,
  type ProbeJobResult,
  probeJobSchema,
} from '../contracts/jobContract';
import { createJobOptions } from '../contracts/jobPolicies';
import {
  ACTIVE_QUEUE_NAMES,
  type ActiveQueueName,
} from '../contracts/queueName';
import {
  QUEUE_ERROR_CODES,
  QueueError,
} from '../errors/queueError';
import { createJobId } from '../idempotency/jobId';

export interface QueueProducerOptions {
  environment: QueueEnvironment;

  applicationName: string;

  onError?: (error: Error) => void;
}

export interface EnqueueResult {
  jobId: string;

  queueName: ActiveQueueName;

  jobName: ActiveJobName;
}

type ProbeQueue = Queue<
  ProbeJobPayload,
  ProbeJobResult,
  ActiveJobName
>;

export class QueueProducer {
  private readonly connection: Redis;

  private readonly queues = new Map<
    ActiveQueueName,
    ProbeQueue
  >();

  private closed = false;

  private closePromise: Promise<void> | undefined;

  constructor(
    private readonly options: QueueProducerOptions,
  ) {
    this.connection = createRedisConnection({
      environment: options.environment,

      role: 'producer',

      connectionName: `${options.applicationName}-producer`,

      onError: (error) => {
        options.onError?.(error);
      },
    });
  }

  async connect(): Promise<void> {
    this.assertOpen();

    await connectRedis(this.connection);

    for (const name of ACTIVE_QUEUE_NAMES) {
      const queue = this.getQueue(name);

      await queue.waitUntilReady();
    }
  }

  async enqueue(
    name: ActiveJobName,
    payload: ProbeJobPayload,
  ): Promise<EnqueueResult> {
    this.assertOpen();

    const queueName = ACTIVE_JOB_QUEUE_MAP[name];

    if (!queueName) {
      throw new QueueError({
        code: QUEUE_ERROR_CODES.NOT_ACTIVE,

        message: 'The requested queue is not active.',
      });
    }

    let validatedPayload: ProbeJobPayload;

    try {
      validatedPayload = probeJobSchema.parse(payload);
    } catch (error) {
      throw new QueueError({
        code: QUEUE_ERROR_CODES.INVALID_PAYLOAD,

        message: 'The job payload is invalid.',

        cause: error,
      });
    }

    const jobId = createJobId({
      name,

      operationId: validatedPayload.operationId,
    });

    try {
      const queue = this.getQueue(queueName);

      await queue.add(name, validatedPayload, {
        ...createJobOptions(name, this.options.environment),

        jobId,
      });

      return {
        jobId,

        queueName,

        jobName: name,
      };
    } catch (error) {
      throw new QueueError({
        code: QUEUE_ERROR_CODES.UNAVAILABLE,

        message: 'The job could not be submitted.',

        cause: error,
      });
    }
  }

  getQueue(name: ActiveQueueName): ProbeQueue {
    this.assertOpen();

    if (!ACTIVE_QUEUE_NAMES.includes(name)) {
      throw new QueueError({
        code: QUEUE_ERROR_CODES.NOT_ACTIVE,

        message: 'The requested queue is not active.',
      });
    }

    const existing = this.queues.get(name);

    if (existing) {
      return existing;
    }

    const queue = new Queue<
      ProbeJobPayload,
      ProbeJobResult,
      ActiveJobName
    >(name, {
      connection: this.connection,

      prefix: this.options.environment.QUEUE_PREFIX,
    });

    queue.on('error', (error: Error) => {
      this.options.onError?.(error);
    });

    this.queues.set(name, queue);

    return queue;
  }

  close(): Promise<void> {
    this.closed = true;

    this.closePromise ??= this.dispose();

    return this.closePromise;
  }

  private async dispose(): Promise<void> {
    try {
      const results = await Promise.allSettled(
        Array.from(this.queues.values(), (queue) => queue.close()),
      );

      for (const result of results) {
        if (result.status === 'rejected') {
          this.options.onError?.(
            new Error('A queue failed to close.'),
          );
        }
      }
    } finally {
      this.queues.clear();

      await closeRedis(this.connection);
    }
  }

  private assertOpen(): void {
    if (this.closed) {
      throw new QueueError({
        code: QUEUE_ERROR_CODES.CLOSED,

        message: 'The queue producer is closed.',
      });
    }
  }
}
