import { UnrecoverableError } from 'bullmq';

export interface RetryableOperationError extends Error {
  readonly retryable: boolean;
}

const hasRetryPolicy = (error: unknown): error is RetryableOperationError =>
  error instanceof Error && 'retryable' in error && typeof error.retryable === 'boolean';

export const rethrowJobError = (error: unknown): never => {
  if (error instanceof UnrecoverableError) {
    throw error;
  }

  if (hasRetryPolicy(error) && !error.retryable) {
    throw new UnrecoverableError(error.message);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new UnrecoverableError('Unexpected non-error job failure.');
};
