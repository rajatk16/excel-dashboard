import type { ActiveQueueName } from '../contracts/queueName';
import { QUEUE_ERROR_CODES, QueueError } from '../errors/queueError';
import type { QueueProducer } from '../producers/queueProducer';

export interface QueueStatistics {
  waiting: number;

  active: number;

  delayed: number;

  completed: number;

  failed: number;

  paused: number;
}

export interface FailedJobSummary {
  jobId: string;

  name: string;

  attemptsMade: number;

  finishedAt: number | null;
}

export class QueueAdministration {
  constructor(private readonly producer: QueueProducer) {}

  async getStatistics(queueName: ActiveQueueName): Promise<QueueStatistics> {
    const queue = this.producer.getQueue(queueName);

    const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'completed', 'failed');

    return {
      waiting: counts.waiting ?? 0,

      active: counts.active ?? 0,

      delayed: counts.delayed ?? 0,

      completed: counts.completed ?? 0,

      failed: counts.failed ?? 0,

      paused: counts.paused ?? 0,
    };
  }

  async listFailedJobs(
    queueName: ActiveQueueName,

    limit = 20,
  ): Promise<FailedJobSummary[]> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('Invalid failed-job limit.');
    }

    const queue = this.producer.getQueue(queueName);

    const jobs = await queue.getFailed(0, limit - 1);

    return jobs.map((job) => ({
      jobId: job.id ?? 'unknown',

      name: job.name,

      attemptsMade: job.attemptsMade,

      finishedAt: job.finishedOn ?? null,
    }));
  }

  async retryFailedJob(
    queueName: ActiveQueueName,

    jobId: string,
  ): Promise<void> {
    const queue = this.producer.getQueue(queueName);

    const job = await queue.getJob(jobId);

    if (!job) {
      throw new QueueError({
        code: QUEUE_ERROR_CODES.JOB_NOT_FOUND,

        message: 'The requested job was not found.',
      });
    }

    if ((await job.getState()) !== 'failed') {
      throw new QueueError({
        code: QUEUE_ERROR_CODES.INVALID_JOB_STATE,

        message: 'Only failed jobs can be retried.',
      });
    }

    await job.retry('failed');
  }
}
