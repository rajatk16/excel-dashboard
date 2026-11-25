import { DATABASE_ERROR_CODES, DatabaseError } from '../src/errors/databaseError';
import type { PrismaClient } from '../src/generated/prisma/client';
import { TransactionManager } from '../src/transactions/transactionManager';

describe('TransactionManager', () => {
  function createManager() {
    const transaction = jest.fn<Promise<unknown>, unknown[]>();

    const client = {
      $transaction: transaction,
    } as unknown as PrismaClient;

    return {
      transaction,
      manager: new TransactionManager(client),
    };
  }

  it('returns the transaction result', async () => {
    const { transaction, manager } = createManager();

    transaction.mockResolvedValue('result');

    await expect(manager.run(() => Promise.resolve('result'))).resolves.toBe('result');

    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it('retries transaction conflicts', async () => {
    const { transaction, manager } = createManager();

    transaction
      .mockRejectedValueOnce(
        new DatabaseError({
          code: DATABASE_ERROR_CODES.TRANSACTION_CONFLICT,
          message: 'Conflict',
          retryable: true,
        }),
      )
      .mockResolvedValueOnce('success');

    await expect(
      manager.runWithRetry(() => Promise.resolve('success'), {
        maxAttempts: 3,
        initialDelayMs: 1,
        maxDelayMs: 1,
      }),
    ).resolves.toBe('success');

    expect(transaction).toHaveBeenCalledTimes(2);
  });

  it('does not retry unique constraint violations', async () => {
    const { transaction, manager } = createManager();

    transaction.mockRejectedValue(
      new DatabaseError({
        code: DATABASE_ERROR_CODES.UNIQUE_CONSTRAINT,
        message: 'Duplicate',
      }),
    );

    await expect(manager.runWithRetry(() => Promise.resolve())).rejects.toMatchObject({
      code: DATABASE_ERROR_CODES.UNIQUE_CONSTRAINT,
    });

    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it('stops after the maximum retry attempts', async () => {
    const { transaction, manager } = createManager();

    transaction.mockRejectedValue(
      new DatabaseError({
        code: DATABASE_ERROR_CODES.TRANSACTION_CONFLICT,
        message: 'Conflict',
        retryable: true,
      }),
    );

    await expect(
      manager.runWithRetry(() => Promise.resolve(), {
        maxAttempts: 3,
        initialDelayMs: 1,
        maxDelayMs: 1,
      }),
    ).rejects.toMatchObject({
      code: DATABASE_ERROR_CODES.TRANSACTION_CONFLICT,
    });

    expect(transaction).toHaveBeenCalledTimes(3);
  });

  it('preserves application exceptions', async () => {
    const { transaction, manager } = createManager();

    const error = new Error('Business operation failed.');

    transaction.mockRejectedValue(error);

    await expect(manager.run(() => Promise.resolve())).rejects.toBe(error);
  });

  it('rejects invalid retry options', async () => {
    const { transaction, manager } = createManager();

    await expect(
      manager.runWithRetry(() => Promise.resolve(), {
        maxAttempts: 0,
      }),
    ).rejects.toThrow('Transaction attempts');

    expect(transaction).not.toHaveBeenCalled();
  });
});
