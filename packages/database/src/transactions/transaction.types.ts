import type { DatabaseTransactionClient } from "../client/databaseClient.types";
import type { Prisma } from "../generated/prisma/client";

export interface TransactionOptions {
  isolationLevel?: Prisma.TransactionIsolationLevel;
  maxWaitMs?: number;
  timeoutMs?: number;
}

export interface TransactionRetryOptions extends TransactionOptions {
  maxAttempts?: number;

  initialDelayMs?: number;

  maxDelayMs?: number;
}

export type TransactionCallback<T> =  (
  transaction: DatabaseTransactionClient
) => Promise<T>;
