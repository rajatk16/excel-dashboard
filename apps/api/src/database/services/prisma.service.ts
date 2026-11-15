import { Injectable, Logger, type OnApplicationShutdown, type OnModuleInit } from "@nestjs/common";

import { createDatabaseClient, type DatabaseClientHandle, type DatabasePoolStatistics, type PrismaClient } from "@excel-dashboard/database";

import type { AppConfigService } from "../../config/services/appConfig.service";

@Injectable()
export class PrismaService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(PrismaService.name);

  private readonly handle: DatabaseClientHandle;

  constructor(
    config: AppConfigService
  ) {
    this.handle = createDatabaseClient({
      applicationName: config.applicationName,
      environment: {
        DATABASE_URL: config.get('DATABASE_URL'),
        DATABASE_POOL_MAX: config.get('DATABASE_POOL_MAX'),
        DATABASE_POOL_IDLE_TIMEOUT_MS: config.get('DATABASE_POOL_IDLE_TIMEOUT_MS'),
        DATABASE_CONNECTION_TIMEOUT_MS: config.get("DATABASE_CONNECTION_TIMEOUT_MS"),
        DATABASE_STATEMENT_TIMEOUT_MS: config.get('DATABASE_STATEMENT_TIMEOUT_MS'),
        DATABASE_LOCK_TIMEOUT_MS:config.get('DATABASE_LOCK_TIMEOUT_MS'),
        DATABASE_IDLE_TRANSACTION_TIMEOUT_MS:config.get('DATABASE_IDLE_TRANSACTION_TIMEOUT_MS'),
        DATABASE_TRANSACTION_MAX_WAIT_MS: config.get('DATABASE_TRANSACTION_MAX_WAIT_MS'),
        DATABASE_TRANSACTION_TIMEOUT_MS: config.get('DATABASE_TRANSACTION_TIMEOUT_MS'),
        DATABASE_HEALTH_TIMEOUT_MS: config.get('DATABASE_HEALTH_TIMEOUT_MS'),
      },
      onPoolError: () => {
        this.logger.error('An idle PostgreSQL connection failed.')
      }
    })
  }

  get client(): PrismaClient {
    return this.handle.client;
  }

  async onModuleInit() {
    try {
      await this.handle.connect();

      this.logger.log('PostgreSQL connection established.')
    } catch {
      await this.handle.disconnect().catch(() => undefined);

      throw new Error(
        'Failed to initialize PostgreSQL connection.'
      )
    }
  }

  async onApplicationShutdown() {
    await this.handle.disconnect();

    this.logger.log(
      'PostgreSQL connection pool closed.'
    )
  }

  getPoolStatistics(): DatabasePoolStatistics {
    return this.handle.getPoolStatistics();
  }
}
