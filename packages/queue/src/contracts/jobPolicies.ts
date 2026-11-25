import type { JobsOptions } from 'bullmq';

import type { QueueEnvironment } from '../config/queueEnvironment';

import { JOB_NAMES, type JobName } from './jobContract';

interface JobPolicy {
  attempts: number;
  backoffDelayMs: number;
}

export const JOB_POLICIES = {
  [JOB_NAMES.INGESTION_PROBE]: {
    attempts: 3,
    backoffDelayMs: 1000,
  },
  [JOB_NAMES.ANALYTICS_PROBE]: {
    attempts: 3,
    backoffDelayMs: 1000,
  },
  [JOB_NAMES.INSPECT_FILE]: {
    attempts: 3,
    backoffDelayMs: 2000,
  },
  [JOB_NAMES.IMPORT_DATASET]: {
    attempts: 3,
    backoffDelayMs: 5000,
  },
  [JOB_NAMES.PROFILE_DATASET]: {
    attempts: 3,
    backoffDelayMs: 3000,
  },
  [JOB_NAMES.EXECUTE_QUERY]: {
    attempts: 2,
    backoffDelayMs: 1000,
  },
  [JOB_NAMES.EXPORT_DASHBOARD]: {
    attempts: 3,
    backoffDelayMs: 5000,
  },
} satisfies Record<JobName, JobPolicy>;

export const createJobOptions = (name: JobName, environment: QueueEnvironment): JobsOptions => {
  const policy = JOB_POLICIES[name];

  if (!policy) {
    throw new Error('Policy not found');
  }

  return {
    attempts: policy.attempts,
    backoff: {
      type: 'exponential',
      delay: policy.backoffDelayMs,
      jitter: 0.5,
    },
    removeOnComplete: {
      age: environment.QUEUE_COMPLETED_RETENTION_SECONDS,
      count: environment.QUEUE_COMPLETED_RETENTION_COUNT,
    },
    removeOnFail: {
      age: environment.QUEUE_FAILED_RETENTION_SECONDS,
      count: environment.QUEUE_FAILED_RETENTION_COUNT,
    },
    stackTraceLimit: 20,
  };
};
