import { Prisma } from "../generated/prisma/client";

import { DATABASE_ERROR_CODES, DatabaseError, type DatabaseErrorCode } from "./databaseError";

interface ErrorDefinition {
  code: DatabaseErrorCode;
  message: string;
  retryable?: boolean;
}

const PRISMA_ERROR_MAP: Readonly<Record<string, ErrorDefinition>> = {
  P1001: {
    code: DATABASE_ERROR_CODES.CONNECTION_UNAVAILABLE,
    message: 'Database connection is unavailable.',
    retryable: true,
  },
  P1002: {
    code: DATABASE_ERROR_CODES.CONNECTION_UNAVAILABLE,
    message: 'Database connection timed out.',
    retryable: true,
  },

  P1008: {
    code: DATABASE_ERROR_CODES.QUERY_TIMEOUT,
    message: 'Database operation timed out.',
  },

  P1017: {
    code: DATABASE_ERROR_CODES.CONNECTION_UNAVAILABLE,
    message: 'Database connection was closed.',
    retryable: true,
  },

  P2000: {
    code: DATABASE_ERROR_CODES.INVALID_VALUE,
    message: 'A database value exceeds its allowed size.',
  },

  P2002: {
    code: DATABASE_ERROR_CODES.UNIQUE_CONSTRAINT,
    message: 'A unique database constraint was violated.',
  },

  P2003: {
    code: DATABASE_ERROR_CODES.FOREIGN_KEY_CONSTRAINT,
    message: 'A database relationship constraint was violated.',
  },

  P2011: {
    code: DATABASE_ERROR_CODES.REQUIRED_VALUE,
    message: 'A required database value is missing.',
  },

  P2024: {
    code: DATABASE_ERROR_CODES.CONNECTION_POOL_TIMEOUT,
    message: 'Database connection pool is exhausted.',
    retryable: true,
  },

  P2025: {
    code: DATABASE_ERROR_CODES.RECORD_NOT_FOUND,
    message: 'The requested database record was not found.',
  },

  P2028: {
    code: DATABASE_ERROR_CODES.TRANSACTION_TIMEOUT,
    message: 'The database transaction could not be completed.',
  },

  P2034: {
    code: DATABASE_ERROR_CODES.TRANSACTION_CONFLICT,
    message: 'A concurrent database transaction conflict occurred.',
    retryable: true,
  },
}

const POSTGRES_ERROR_MAP: Readonly<Record<string, ErrorDefinition>> = {
  '23505': {
    code: DATABASE_ERROR_CODES.UNIQUE_CONSTRAINT,
    message: 'A unique database constraint was violated.'
  },
  '23503': {
    code: DATABASE_ERROR_CODES.FOREIGN_KEY_CONSTRAINT,
    message: 'A database relationship constraint was violated.',
  },

  '23502': {
    code: DATABASE_ERROR_CODES.REQUIRED_VALUE,
    message: 'A required database value is missing.',
  },

  '22001': {
    code: DATABASE_ERROR_CODES.INVALID_VALUE,
    message: 'A database value exceeds its allowed size.',
  },

  '40001': {
    code: DATABASE_ERROR_CODES.TRANSACTION_CONFLICT,
    message: 'A database serialization conflict occurred.',
    retryable: true,
  },

  '40P01': {
    code: DATABASE_ERROR_CODES.TRANSACTION_CONFLICT,
    message: 'A database deadlock occurred.',
    retryable: true,
  },

  '55P03': {
    code: DATABASE_ERROR_CODES.TRANSACTION_CONFLICT,
    message: 'A database lock could not be acquired.',
    retryable: true,
  },

  '57014': {
    code: DATABASE_ERROR_CODES.QUERY_TIMEOUT,
    message: 'A database query was cancelled or timed out.',
  },

  '53300': {
    code: DATABASE_ERROR_CODES.CONNECTION_POOL_TIMEOUT,
    message: 'Database connection capacity was exceeded.',
    retryable: true,
  },

  '57P01': {
    code: DATABASE_ERROR_CODES.CONNECTION_UNAVAILABLE,
    message: 'The database server is shutting down.',
    retryable: true,
  },

  '08001': {
    code: DATABASE_ERROR_CODES.CONNECTION_UNAVAILABLE,
    message: 'Database connection is unavailable.',
    retryable: true,
  },

  '08006': {
    code: DATABASE_ERROR_CODES.CONNECTION_UNAVAILABLE,
    message: 'Database connection failed.',
    retryable: true,
  },
}

const createError = (
  definition: ErrorDefinition,
  cause: unknown,
): DatabaseError => new DatabaseError({
  ...definition,
  cause
})

const readyStringProperty = (
  value: unknown,
  property: string
): string | undefined => {
  if (
    typeof value !== 'object' || value === null
  ) {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  const result = record[property];

  return typeof result === 'string' ? result : undefined;
}

const readProperty = (
  value: unknown,
  property: string
): unknown => {
  if (
    typeof value !== 'object' || value === null
  ) {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  return record[property];
}

const findPostgresError = (
  error: unknown,
  depth = 0
): ErrorDefinition | undefined => {
  if (depth > 5) return undefined;

  const code = readyStringProperty(error, 'code');

  const originalCode = readyStringProperty(error,'originalCode');

  const definition = (code ? POSTGRES_ERROR_MAP[code] : undefined) ?? (originalCode ? POSTGRES_ERROR_MAP[originalCode] : undefined);

  if (definition) return definition;

  const nestedValues = [
    readProperty(error, 'cause'),
    readProperty(error, 'meta'),
    readProperty(error, 'driverAdapterError')
  ];

  for (const nested of nestedValues) {
    if (nested === undefined || nested === error) {
      continue;
    }

    const result = findPostgresError(nested, depth + 1);

    if (result) {
      return result;
    }
  }

  return undefined;
}

export const tryNormalizeDatabaseError = (
  error: unknown
): DatabaseError | undefined => {
  if (error instanceof DatabaseError) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const definition = PRISMA_ERROR_MAP[error.code];

    if (definition) {
      return createError(definition, error);
    }

    const postgresDefinition = findPostgresError(error);

    if (postgresDefinition) return createError(postgresDefinition, error);

    return new DatabaseError({
      code: DATABASE_ERROR_CODES.UNKNOWN,
      message: 'A database operation failed.',
      cause: error
    })
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError
  ) {
    const definition = error.errorCode ? PRISMA_ERROR_MAP[error.errorCode] : undefined;

    return createError(
      definition ?? {
        code: DATABASE_ERROR_CODES.CONNECTION_UNAVAILABLE,
        message: 'Database initialization failed.'
      },
      error
    )
  }

  if (
    error instanceof Prisma.PrismaClientUnknownRequestError || error instanceof Prisma.PrismaClientValidationError
  ) {
    const definition = findPostgresError(error);

    return createError(
      definition ?? {
        code: DATABASE_ERROR_CODES.UNKNOWN,
        message: 'A database operation failed.'
      },
      error
    );
  }

  const postgresDefinition = findPostgresError(error);

  if (postgresDefinition) return createError(postgresDefinition, error);

  const code = readyStringProperty(error, 'code');

  if (
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND'
  ) {
    return new DatabaseError({
      code:
        DATABASE_ERROR_CODES.CONNECTION_UNAVAILABLE,
      message: 'Database connection is unavailable.',
      retryable: true,
      cause: error,
    });
  }

  return undefined;
}

export const normalizeDatabaseError = (
  error: unknown
): DatabaseError => (
  tryNormalizeDatabaseError(error) ?? new DatabaseError({
    code: DATABASE_ERROR_CODES.UNKNOWN,
    message: 'An unexpected database error occurred.',
    cause: error
  })
)
