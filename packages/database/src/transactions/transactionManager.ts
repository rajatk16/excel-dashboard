import { randomInt } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';

import {
  DATABASE_ERROR_CODES,
} from '../errors/databaseError';
import {
  tryNormalizeDatabaseError,
} from '../errors/normalizeDatabaseError';
import type {
  PrismaClient,
} from '../generated/prisma/client';

import type {
  TransactionCallback,
  TransactionOptions,
  TransactionRetryOptions,
} from './transaction.types';

export class TransactionManager {
  constructor(
    private readonly client: PrismaClient,
  ) {}

  async run<T>(
    callback: TransactionCallback<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    try {
      return await this.client.$transaction(
        callback,
        {
          ...(options.isolationLevel !== undefined
            ? {
                isolationLevel:
                  options.isolationLevel,
              }
            : {}),

          ...(options.maxWaitMs !== undefined
            ? {
                maxWait: options.maxWaitMs,
              }
            : {}),

          ...(options.timeoutMs !== undefined
            ? {
                timeout: options.timeoutMs,
              }
            : {}),
        },
      );
    } catch (error) {
      throw (
        tryNormalizeDatabaseError(error) ??
        error
      );
    }
  }

  async runWithRetry<T>(
    callback: TransactionCallback<T>,
    options: TransactionRetryOptions = {},
  ): Promise<T> {
    const maxAttempts = options.maxAttempts ?? 3;

    const initialDelayMs =
      options.initialDelayMs ?? 50;

    const maxDelayMs =
      options.maxDelayMs ?? 1000;

    this.validateRetryOptions(
      maxAttempts,
      initialDelayMs,
      maxDelayMs,
    );

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt += 1
    ) {
      try {
        return await this.run(callback, options);
      } catch (error) {
        const databaseError =
          tryNormalizeDatabaseError(error);

        const shouldRetry =
          databaseError?.code ===
            DATABASE_ERROR_CODES.TRANSACTION_CONFLICT &&
          attempt < maxAttempts;

        if (!shouldRetry) {
          throw error;
        }

        const exponentialDelay = Math.min(
          maxDelayMs,
          initialDelayMs * 2 ** (attempt - 1),
        );

        const delay = randomInt(
          0,
          exponentialDelay + 1,
        );

        await setTimeout(delay);
      }
    }

    throw new Error(
      'Transaction retry loop terminated unexpectedly.',
    );
  }

  private validateRetryOptions(
    maxAttempts: number,
    initialDelayMs: number,
    maxDelayMs: number,
  ): void {
    if (
      !Number.isInteger(maxAttempts) ||
      maxAttempts < 1 ||
      maxAttempts > 5
    ) {
      throw new Error(
        'Transaction attempts must be between 1 and 5.',
      );
    }

    if (
      !Number.isInteger(initialDelayMs) ||
      initialDelayMs < 1 ||
      !Number.isInteger(maxDelayMs) ||
      maxDelayMs < initialDelayMs ||
      maxDelayMs > 10000
    ) {
      throw new Error(
        'Invalid transaction retry delay configuration.',
      );
    }
  }
}
