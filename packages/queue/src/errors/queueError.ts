export const QUEUE_ERROR_CODES = {
  UNAVAILABLE: 'QUEUE_UNAVAILABLE',
  INVALID_PAYLOAD: 'QUEUE_INVALID_PAYLOAD',
  NOT_ACTIVE: 'QUEUE_NOT_ACTIVE',
  CLOSED: 'QUEUE_CLOSED',
  JOB_NOT_FOUND: 'QUEUE_JOB_NOT_FOUND',
  INVALID_JOB_STATE: 'QUEUE_INVALID_JOB_STATE',
  PERMANENT_JOB_FAILURE: 'QUEUE_PERMANENT_JOB_FAILURE',
};

export type QueueErrorCode = (typeof QUEUE_ERROR_CODES)[keyof typeof QUEUE_ERROR_CODES];

export interface QueueErrorOptions {
  code: QueueErrorCode;
  message: string;
  cause?: unknown;
}

export class QueueError extends Error {
  readonly code: QueueErrorCode;

  constructor(options: QueueErrorOptions) {
    super(options.message, {
      cause: options.cause,
    });

    this.name = 'QueueError';
    this.code = options.code;
  }
}

export class PermanentJobError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermanentJobError';
  }
}
