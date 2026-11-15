export const DATABASE_ERROR_CODES = {
  UNIQUE_CONSTRAINT: 'DATABASE_UNIQUE_CONSTRAINT',

  FOREIGN_KEY_CONSTRAINT:
    'DATABASE_FOREIGN_KEY_CONSTRAINT',

  REQUIRED_VALUE: 'DATABASE_REQUIRED_VALUE',

  RECORD_NOT_FOUND: 'DATABASE_RECORD_NOT_FOUND',

  INVALID_VALUE: 'DATABASE_INVALID_VALUE',

  TRANSACTION_CONFLICT:
    'DATABASE_TRANSACTION_CONFLICT',

  TRANSACTION_TIMEOUT:
    'DATABASE_TRANSACTION_TIMEOUT',

  CONNECTION_UNAVAILABLE:
    'DATABASE_CONNECTION_UNAVAILABLE',

  CONNECTION_POOL_TIMEOUT:
    'DATABASE_CONNECTION_POOL_TIMEOUT',

  QUERY_TIMEOUT: 'DATABASE_QUERY_TIMEOUT',

  UNKNOWN: 'DATABASE_UNKNOWN_ERROR',
} as const;

export type DatabaseErrorCode =
  (typeof DATABASE_ERROR_CODES)[keyof typeof DATABASE_ERROR_CODES];

export interface DatabaseErrorOptions {
  code: DatabaseErrorCode;
  message: string;
  retryable?: boolean;
  cause?: unknown;
}

export class DatabaseError extends Error {
  readonly code: DatabaseErrorCode;

  readonly retryable: boolean;

  constructor(options: DatabaseErrorOptions) {
    super(options.message, {
      cause: options.cause,
    });

    this.name = 'DatabaseError';

    this.code = options.code;

    this.retryable = options.retryable ?? false;
  }
}
