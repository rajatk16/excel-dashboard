import { Injectable, type OnApplicationShutdown, type OnModuleInit } from "@nestjs/common";

import { QueueHealth } from "@excel-dashboard/queue";

import type { AppConfigService } from "../../config/services/appConfig.service";

import { getQueueEnvironment } from "./queue.service";

@Injectable()
export class QueueHealthService implements OnModuleInit, OnApplicationShutdown {
  private readonly health: QueueHealth;

  constructor(
    config: AppConfigService
  ) {
    this.health = new QueueHealth(
      getQueueEnvironment(config),
      config.applicationName
    )
  }

  async onModuleInit() {
    try {
      await this.health.connect();
    } catch {
      await this.health.close().catch(() => undefined);
    }
  }

  check() {
    return this.health.check();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.health.close();
  }
}
