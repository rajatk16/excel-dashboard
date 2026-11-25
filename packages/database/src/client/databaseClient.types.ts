import type { DatabaseEnvironment } from '../config/databaseEnvironment';
import type { Prisma, PrismaClient } from '../generated/prisma/client';

export interface DatabaseClientOptions {
  environment: DatabaseEnvironment;
  applicationName: string;
  onPoolError?: (error: Error) => void;
}

export interface DatabaseClientHandle {
  readonly client: PrismaClient;

  connect(): Promise<void>;

  disconnect(): Promise<void>;

  getPoolStatistics(): DatabasePoolStatistics;
}

export interface DatabasePoolStatistics {
  totalConnections: number;
  idleConnections: number;
  waitingRequests: number;
}

export type DatabaseTransactionClient = Prisma.TransactionClient;

export type DatabaseExecutor = PrismaClient | DatabaseTransactionClient;
