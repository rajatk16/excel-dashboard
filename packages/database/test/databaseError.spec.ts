import {
  DATABASE_ERROR_CODES,
  DatabaseError,
} from '../src/errors/databaseError';
import {
  normalizeDatabaseError,
  tryNormalizeDatabaseError,
} from '../src/errors/normalizeDatabaseError';
import {
  Prisma,
} from '../src/generated/prisma/client';

function prismaError(
  code: string,
): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError(
    'Sensitive internal database error.',
    {
      code,
      clientVersion: 'test',
    },
  );
}

describe('Database error normalization', () => {
  it('normalizes unique constraint violations', () => {
    const result =
      normalizeDatabaseError(
        prismaError('P2002'),
      );

    expect(result.code).toBe(
      DATABASE_ERROR_CODES.UNIQUE_CONSTRAINT,
    );

    expect(result.retryable).toBe(false);
  });

  it('normalizes missing records', () => {
    const result =
      normalizeDatabaseError(
        prismaError('P2025'),
      );

    expect(result.code).toBe(
      DATABASE_ERROR_CODES.RECORD_NOT_FOUND,
    );
  });

  it('normalizes transaction conflicts', () => {
    const result =
      normalizeDatabaseError(
        prismaError('P2034'),
      );

    expect(result.code).toBe(
      DATABASE_ERROR_CODES.TRANSACTION_CONFLICT,
    );

    expect(result.retryable).toBe(true);
  });

  it('normalizes PostgreSQL serialization errors', () => {
    const result =
      normalizeDatabaseError({
        code: '40001',
      });

    expect(result.code).toBe(
      DATABASE_ERROR_CODES.TRANSACTION_CONFLICT,
    );
  });

  it('normalizes nested PostgreSQL errors', () => {
    const result =
      normalizeDatabaseError({
        cause: {
          originalCode: '23505',
        },
      });

    expect(result.code).toBe(
      DATABASE_ERROR_CODES.UNIQUE_CONSTRAINT,
    );
  });

  it('preserves an existing DatabaseError', () => {
    const error = new DatabaseError({
      code: DATABASE_ERROR_CODES.UNKNOWN,
      message: 'Database failure.',
    });

    expect(
      normalizeDatabaseError(error),
    ).toBe(error);
  });

  it('does not classify arbitrary application errors', () => {
    expect(
      tryNormalizeDatabaseError(
        new Error('Application error'),
      ),
    ).toBeUndefined();
  });

  it('sanitizes normalized error messages', () => {
    const result =
      normalizeDatabaseError(
        prismaError('P2002'),
      );

    expect(result.message).not.toContain(
      'Sensitive internal database error',
    );
  });
});
