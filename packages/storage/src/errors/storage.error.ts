import { S3ServiceException } from '@aws-sdk/client-s3';

export const STORAGE_ERROR_CODES = {
  NOT_FOUND: 'STORAGE_NOT_FOUND',
  ACCESS_DENIED: 'STORAGE_ACCESS_DENIED',
  CONFLICT: 'STORAGE_CONFLICT',
  INVALID_REQUEST: 'STORAGE_INVALID_REQUEST',
  UNAVAILABLE: 'STORAGE_UNAVAILABLE',
  TIMEOUT: 'STORAGE_TIMEOUT',
  CANCELLED: 'STORAGE_CANCELLED',
  LIMIT_EXCEEDED: 'STORAGE_LIMIT_EXCEEDED',
  UNKNOWN: 'STORAGE_UNKNOWN_ERROR',
};

export type StorageErrorCode = (typeof STORAGE_ERROR_CODES)[keyof typeof STORAGE_ERROR_CODES];

export class StorageError extends Error {
  constructor(
    public readonly code: StorageErrorCode,
    message: string,
    public readonly retryable: boolean,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'StorageError';
  }
}

export const normalizeStorageError = (error: unknown): StorageError => {
  if (error instanceof StorageError) {
    return error;
  }

  const name = error instanceof Error ? error.name : '';

  if (name === 'AbortError') {
    return new StorageError(
      STORAGE_ERROR_CODES.CANCELLED,
      'Storage operation was cancelled.',
      false,
      { cause: error },
    );
  }

  if (name === 'TimeoutError') {
    return new StorageError(STORAGE_ERROR_CODES.TIMEOUT, 'Storage operation timed out', true, {
      cause: error,
    });
  }

  if (error instanceof S3ServiceException) {
    const status = error.$metadata.httpStatusCode;

    if (status === 404 || ['NoSuchKey', 'NotFound', 'NoSuchBucket'].includes(name)) {
      return new StorageError(
        STORAGE_ERROR_CODES.NOT_FOUND,
        'Storage resource was not found.',
        false,
        { cause: error },
      );
    }

    if (status === 401 || status === 403) {
      return new StorageError(
        STORAGE_ERROR_CODES.ACCESS_DENIED,
        'Storage access was denied',
        false,
        { cause: error },
      );
    }

    if (status === 409 || status === 412) {
      return new StorageError(
        STORAGE_ERROR_CODES.CONFLICT,
        'Storage resource conflicts with the requested operation.',
        false,
        { cause: error },
      );
    }

    if (
      status === 429 ||
      (status !== undefined && status >= 500) ||
      error.$retryable !== undefined
    ) {
      return new StorageError(
        STORAGE_ERROR_CODES.UNAVAILABLE,
        'Object storage is temporarily unavailable.',
        true,
        { cause: error },
      );
    }

    if (status !== undefined && status >= 400) {
      return new StorageError(
        STORAGE_ERROR_CODES.INVALID_REQUEST,
        'Object storage rejected the request.',
        false,
        { cause: error },
      );
    }
  }

  const networkCode = error instanceof Error && 'code' in error ? error.code : undefined;

  if (
    typeof networkCode === 'string' &&
    ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE', 'EAI_AGAIN', 'ENETUNREACH'].includes(
      networkCode,
    )
  ) {
    return new StorageError(
      STORAGE_ERROR_CODES.UNAVAILABLE,
      'Unable to communicate with object storage.',
      true,
      { cause: error },
    );
  }

  return new StorageError(
    STORAGE_ERROR_CODES.UNKNOWN,
    'An unexpected storage error occurred',
    false,
    { cause: error },
  );
};
