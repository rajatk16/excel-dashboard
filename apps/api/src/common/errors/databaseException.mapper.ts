import {
  HttpStatus,
} from '@nestjs/common';

import {
  DATABASE_ERROR_CODES,
  tryNormalizeDatabaseError,
} from '@excel-dashboard/database';

import type {
  ApiErrorBody,
} from '../types/apiResponse.type';

export interface MappedDatabaseException {
  statusCode: number;
  error: ApiErrorBody;
}

export function mapDatabaseException(
  exception: unknown,
): MappedDatabaseException | undefined {
  const databaseError =
    tryNormalizeDatabaseError(exception);

  if (!databaseError) {
    return undefined;
  }

  switch (databaseError.code) {
    case DATABASE_ERROR_CODES.UNIQUE_CONSTRAINT:
      return {
        statusCode: HttpStatus.CONFLICT,
        error: {
          code: 'RESOURCE_ALREADY_EXISTS',
          message:
            'A resource with the supplied values already exists.',
        },
      };

    case DATABASE_ERROR_CODES.FOREIGN_KEY_CONSTRAINT:
      return {
        statusCode: HttpStatus.CONFLICT,
        error: {
          code: 'RESOURCE_RELATIONSHIP_CONFLICT',
          message:
            'The operation conflicts with a related resource.',
        },
      };

    case DATABASE_ERROR_CODES.RECORD_NOT_FOUND:
      return {
        statusCode: HttpStatus.NOT_FOUND,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message:
            'The requested resource was not found.',
        },
      };

    case DATABASE_ERROR_CODES.TRANSACTION_CONFLICT:
      return {
        statusCode: HttpStatus.CONFLICT,
        error: {
          code: 'CONCURRENT_MODIFICATION',
          message:
            'The resource was modified concurrently. Please try again.',
        },
      };

    case DATABASE_ERROR_CODES.CONNECTION_UNAVAILABLE:
    case DATABASE_ERROR_CODES.CONNECTION_POOL_TIMEOUT:
      return {
        statusCode:
          HttpStatus.SERVICE_UNAVAILABLE,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message:
            'The service is temporarily unavailable.',
        },
      };

    case DATABASE_ERROR_CODES.QUERY_TIMEOUT:
    case DATABASE_ERROR_CODES.TRANSACTION_TIMEOUT:
      return {
        statusCode:
          HttpStatus.SERVICE_UNAVAILABLE,
        error: {
          code: 'DATABASE_OPERATION_TIMEOUT',
          message:
            'The operation could not be completed in time.',
        },
      };

    case DATABASE_ERROR_CODES.REQUIRED_VALUE:
    case DATABASE_ERROR_CODES.INVALID_VALUE:
    case DATABASE_ERROR_CODES.UNKNOWN:
      return {
        statusCode:
          HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'An unexpected error occurred.',
        },
      };
  }
}
