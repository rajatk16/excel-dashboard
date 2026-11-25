import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { PrismaClient } from '../generated/prisma/client';

import type {
  DatabaseClientHandle,
  DatabaseClientOptions,
  DatabasePoolStatistics,
} from './databaseClient.types';

export const createDatabaseClient = (options: DatabaseClientOptions): DatabaseClientHandle => {
  const { environment, applicationName } = options;

  const pool = new Pool({
    connectionString: environment.DATABASE_URL,
    application_name: applicationName,
    max: environment.DATABASE_POOL_MAX,
    idleTimeoutMillis: environment.DATABASE_POOL_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: environment.DATABASE_CONNECTION_TIMEOUT_MS,
    statement_timeout: environment.DATABASE_STATEMENT_TIMEOUT_MS,
    lock_timeout: environment.DATABASE_LOCK_TIMEOUT_MS,
    idle_in_transaction_session_timeout: environment.DATABASE_IDLE_TRANSACTION_TIMEOUT_MS,
    allowExitOnIdle: false,
  });

  pool.on('error', (error: Error) => {
    options.onPoolError?.(error);
  });

  const adapter = new PrismaPg(pool, {
    disposeExternalPool: false,
  });

  const client = new PrismaClient({
    adapter,
    transactionOptions: {
      maxWait: environment.DATABASE_TRANSACTION_MAX_WAIT_MS,
      timeout: environment.DATABASE_TRANSACTION_TIMEOUT_MS,
    },
  });

  let disconnectPromise: Promise<void> | undefined;

  return {
    client,
    async connect(): Promise<void> {
      if (disconnectPromise) {
        throw new Error('Cannot connect a disposed database client.');
      }
      await client.$connect();
      await client.$queryRaw`SELECT 1`;
    },
    disconnect(): Promise<void> {
      disconnectPromise ??= (async () => {
        try {
          await client.$disconnect();
        } finally {
          await pool.end();
        }
      })();

      return disconnectPromise;
    },
    getPoolStatistics(): DatabasePoolStatistics {
      return {
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingRequests: pool.waitingCount,
      };
    },
  };
};
