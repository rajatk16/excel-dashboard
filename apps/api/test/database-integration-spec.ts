import {
  randomUUID,
} from 'node:crypto';
import type {
  Server,
} from 'node:http';

import {
  Controller,
  Get,
} from '@nestjs/common';
import type {
  NestExpressApplication,
} from '@nestjs/platform-express';
import {
  Test,
} from '@nestjs/testing';
import request from 'supertest';

import {
  DATABASE_ERROR_CODES,
  normalizeDatabaseError,
} from '@excel-dashboard/database';

import { configureApplication } from '../src/bootstrap/configureApplication';
import { DatabaseHealthService } from '../src/database/services/databaseHealth.service';
import { PrismaService } from '../src/database/services/prisma.service';
import { TransactionService } from '../src/database/services/transaction.service';

import type {
  PostgresTestContainer,
} from './helpers/postgres-test-container';
import {
  startPostgresTestContainer,
} from './helpers/postgres-test-container';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const expectRecord = (value: unknown): Record<string, unknown> => {
  if (!isRecord(value)) {
    throw new Error('Expected response body property to be an object.');
  }

  return value;
};

@Controller('database-test')
class DatabaseTestController {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  @Get('duplicate')
  async duplicate(): Promise<void> {
    const key = randomUUID();

    await this.prisma.client.systemSetting.create({
      data: {
        key,
        value: true,
      },
    });

    await this.prisma.client.systemSetting.create({
      data: {
        key,
        value: false,
      },
    });
  }
}

describe('PostgreSQL integration', () => {
  let postgres:
    | PostgresTestContainer
    | undefined;

  let app:
    | NestExpressApplication
    | undefined;

  let prisma: PrismaService;

  let transactions: TransactionService;

  let server: Server;

  const originalDatabaseUrl =
    process.env.DATABASE_URL;

  beforeAll(async () => {
    postgres =
      await startPostgresTestContainer();

    process.env.DATABASE_URL =
      postgres.databaseUrl;

    // AppModule must be loaded after DATABASE_URL
    // points to the isolated test container.
    const { AppModule } =
      await import('../src/app.module.js');

    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
        controllers: [
          DatabaseTestController,
        ],
      }).compile();

    app =
      moduleRef.createNestApplication<
        NestExpressApplication
      >({
        bodyParser: false,
        logger: false,
      });

    configureApplication(app);

    await app.init();

    prisma = app.get(PrismaService);

    transactions =
      app.get(TransactionService);

    server = app.getHttpServer();
  });

  afterEach(async () => {
    if (app) {
      await prisma.client.systemSetting
        .deleteMany();
    }
  });

  afterAll(async () => {
    try {
      await app?.close();
    } finally {
      try {
        await postgres?.stop();
      } finally {
        if (originalDatabaseUrl === undefined) {
          delete process.env.DATABASE_URL;
        } else {
          process.env.DATABASE_URL =
            originalDatabaseUrl;
        }
      }
    }
  });

  it('connects to PostgreSQL', async () => {
    const result =
      await prisma.client.$queryRaw<
        Array<{ value: number }>
      >`SELECT 1 AS value`;

    expect(result).toEqual([
      {
        value: 1,
      },
    ]);
  });

  it('creates and reads records', async () => {
    await prisma.client.systemSetting.create({
      data: {
        key: 'integration-test',
        value: {
          enabled: true,
        },
      },
    });

    const result =
      await prisma.client.systemSetting.findUnique({
        where: {
          key: 'integration-test',
        },
      });

    expect(result?.value).toEqual({
      enabled: true,
    });
  });

  it('commits successful transactions', async () => {
    await transactions.run(
      async (transaction) => {
        await transaction.systemSetting.create({
          data: {
            key: 'transaction-a',
            value: true,
          },
        });

        await transaction.systemSetting.create({
          data: {
            key: 'transaction-b',
            value: true,
          },
        });
      },
    );

    expect(
      await prisma.client.systemSetting.count(),
    ).toBe(2);
  });

  it('rolls back failed transactions', async () => {
    await expect(
      transactions.run(
        async (transaction) => {
          await transaction.systemSetting.create({
            data: {
              key: 'rollback-test',
              value: true,
            },
          });

          throw new Error(
            'Force transaction rollback',
          );
        },
      ),
    ).rejects.toThrow(
      'Force transaction rollback',
    );

    const result =
      await prisma.client.systemSetting.findUnique({
        where: {
          key: 'rollback-test',
        },
      });

    expect(result).toBeNull();
  });

  it('enforces unique constraints', async () => {
    await prisma.client.systemSetting.create({
      data: {
        key: 'duplicate',
        value: true,
      },
    });

    try {
      await prisma.client.systemSetting.create({
        data: {
          key: 'duplicate',
          value: false,
        },
      });

      throw new Error(
        'Expected a unique constraint violation.',
      );
    } catch (error) {
      const normalized =
        normalizeDatabaseError(error);

      expect(normalized.code).toBe(
        DATABASE_ERROR_CODES.UNIQUE_CONSTRAINT,
      );
    }
  });

  it('maps actual Prisma errors into HTTP responses', async () => {
    await request(server)
      .get('/api/v1/database-test/duplicate')
      .expect(409)
      .expect(({ body }: { body: unknown }) => {
        expect(body).toMatchObject({
          success: false,
          error: {
            code: 'RESOURCE_ALREADY_EXISTS',
          },
        });

        const responseBody = expectRecord(body);
        const meta = expectRecord(responseBody.meta);

        expect(typeof meta.requestId).toBe('string');
      });
  });

  it('returns connection pool statistics', () => {
    const statistics =
      prisma.getPoolStatistics();

    expect(
      statistics.totalConnections,
    ).toBeGreaterThanOrEqual(1);

    expect(
      statistics.waitingRequests,
    ).toBeGreaterThanOrEqual(0);
  });

  it('reports database health', async () => {
    if (!app) {
      throw new Error(
        'Test application is unavailable.',
      );
    }

    const health =
      app.get(DatabaseHealthService);

    await expect(
      health.check(),
    ).resolves.toMatchObject({
      status: 'up',
    });
  });

  it('returns successful readiness', async () => {
    await request(server)
      .get('/health/ready')
      .expect(200)
      .expect({
        status: 'ready',
        dependencies: {
          database: 'up',
        },
      });
  });

  it('returns 503 when the database health check fails', async () => {
    if (!app) {
      throw new Error(
        'Test application is unavailable.',
      );
    }

    const health =
      app.get(DatabaseHealthService);

    const spy = jest
      .spyOn(health, 'check')
      .mockResolvedValue({
        status: 'down',
        latencyMs: 2000,
      });

    try {
      await request(server)
        .get('/health/ready')
        .expect(503);

      await request(server)
        .get('/health/live')
        .expect(200);
    } finally {
      spy.mockRestore();
    }
  });
});
