import { type Job, UnrecoverableError, Worker } from "bullmq";
import type Redis from "ioredis";

import type { WorkerEnvironment } from "../config/workerEnvironment";
import { closeRedis, createRedisConnection } from "../connections/redisConnection";
import { ACTIVE_JOB_QUEUE_MAP, type ActiveJobName, parseJobPayload, type ProbeJobPayload, type ProbeJobResult } from "../contracts/jobContract";
import type { ActiveQueueName } from "../contracts/queueName";
import { PermanentJobError } from "../errors/queueError";

export interface JobExecutionContext {
  jobId: string;
  attemptsMade: number;
  workerName: string;
  updateProgress(progress: number): Promise<void>;
}

export type ProbeJobProcessor = (
  payload: ProbeJobPayload,
  context: JobExecutionContext
) => Promise<ProbeJobResult>;

export interface QueueConsumerOptions {
  environment: WorkerEnvironment;
  queueName: ActiveQueueName;
  jobName: ActiveJobName;
  processor: ProbeJobProcessor;
  onError?: (error: Error) => void;
  onCompleted?: (jobId: string) => void;
  onFailed?: (
    jobId: string | undefined,
    attemptsMade: number
   ) => void;
  onStalled?: (jobId: string) => void;
}

export class QueueConsumer {
  private readonly connection: Redis;
  private readonly worker: Worker<ProbeJobPayload, ProbeJobResult, ActiveJobName>;
  private running = false;
  private closing = false;
  private runPromise: Promise<void> | undefined;
  private closePromise: Promise<void> | undefined;

  constructor(
    private readonly options: QueueConsumerOptions
  ) {
    if (
      ACTIVE_JOB_QUEUE_MAP[options.jobName] !== options.queueName
    ) {
      throw new Error('Invalid worker queue and job configuration.');
    }

    const environment = options.environment;

    this.connection = createRedisConnection({
      environment,
      role: 'worker',
      connectionName: `${environment.WORKER_NAME}-consumer`,
      onError: (error) => {
        options.onError?.(error);
      }
    });

    this.worker = new Worker<ProbeJobPayload, ProbeJobResult, ActiveJobName>(options.queueName, (job) => this.process(job), {
      connection: this.connection,
      prefix: environment.QUEUE_PREFIX,
      autorun: false,
      concurrency: environment.WORKER_CONCURRENCY,
      lockDuration: environment.WORKER_LOCK_DURATION_MS,
      stalledInterval: environment.WORKER_STALLED_INTERVAL_MS,
      maxStalledCount: environment.WORKER_MAX_STALLED_COUNT
    });

    this.worker.on('error', (error: Error) => {
      options.onError?.(error);
    });

    this.worker.on('completed', (job) => {
      options.onCompleted?.(job.id ?? 'unknown');
    });

    this.worker.on('failed', (job) => {
      options.onFailed?.(
        job?.id,
        job?.attemptsMade ?? 0,
      )
    });

    this.worker.on('stalled', (jobId) => {
      options.onStalled?.(jobId);
    });
  }

  async start(): Promise<void> {
    if (this.closing || this.runPromise) {
      throw new Error('Worker cannot be started.');
    }

    await this.worker.waitUntilReady();

    if(this.closing) {
      throw new Error('Worker is shutting down.');
    }

    this.running = true;

    this.runPromise = this.worker.run().catch((error: unknown) => {
      this.options.onError?.(error instanceof Error ? error : new Error('Worker execution failed'));
    }).finally(() => {
      this.running = false;
    })
  }

  isRunning(): boolean {
    return (
      this.running && !this.closing && this.worker.isRunning()
    )
  }

  isReady(): boolean {
    return (
      this.isRunning() && this.connection.status === 'ready'
    );
  }

  close(): Promise<void> {
    this.closing = true;

    this.closePromise ??= this.dispose();

    return this.closePromise;
  }

  private async dispose(): Promise<void> {
    try {
      await this.worker.close();

      await this.runPromise;
    } finally {
      await closeRedis(this.connection);

      this.running = false;
    }
  }

  private async process(
    job: Job<ProbeJobPayload, ProbeJobResult, ActiveJobName>,
  ): Promise<ProbeJobResult> {
    if (job.name !== this.options.jobName) {
      throw new UnrecoverableError('Unsupported job type.');
    }

    let payload: ProbeJobPayload;

    try {
      payload = parseJobPayload(job.name, job.data);
    } catch {
      throw new UnrecoverableError('Invalid job payload.');
    }

    if (!job.id) {
      throw new UnrecoverableError('Missing job identifier.');
    }

    try {
      return await this.options.processor(payload, {
        jobId: job.id,

        attemptsMade: job.attemptsMade,

        workerName: this.options.environment.WORKER_NAME,

        updateProgress: async (progress) => {
          if (
            !Number.isFinite(progress) ||
            progress < 0 ||
            progress > 100
          ) {
            throw new PermanentJobError('Invalid job progress.');
          }

          await job.updateProgress(progress);
        },
      });
    } catch (error) {
      if (error instanceof PermanentJobError) {
        throw new UnrecoverableError('Permanent job failure.');
      }

      // Do not persist arbitrary exception messages containing secrets
      // or user-provided spreadsheet data in Redis.
      throw new Error('Job execution failed.');
    }
  }
}
