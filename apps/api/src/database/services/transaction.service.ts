import { Injectable } from "@nestjs/common";

import { type TransactionCallback, TransactionManager, type TransactionOptions, type TransactionRetryOptions } from "@excel-dashboard/database";

import type { PrismaService } from "./prisma.service";

@Injectable()
export class TransactionService {
  private readonly manager: TransactionManager;

  constructor(
    prismaService: PrismaService
  ) {
    this.manager = new TransactionManager(
      prismaService.client
    );
  }

  run<T>(
    callback: TransactionCallback<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    return this.manager.run(
      callback,
      options
    )
  }

  runWithRetry<T>(
    callback: TransactionCallback<T>,
    options: TransactionRetryOptions = {},
  ): Promise<T> {
    return this.manager.runWithRetry(
      callback,
      options,
    );
  }
}
