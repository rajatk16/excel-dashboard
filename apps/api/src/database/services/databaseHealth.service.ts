import { Injectable } from "@nestjs/common";

import type { AppConfigService } from "../../config/services/appConfig.service";

import type { PrismaService } from "./prisma.service";

export interface DatabaseHealthResult {
  status: 'up' | 'down';
  latencyMs: number;
}

@Injectable()
export class DatabaseHealthService {
  private activeCheck: Promise<DatabaseHealthResult> | undefined;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly config: AppConfigService
  ) {}

  async check(): Promise<DatabaseHealthResult> {
    const startedAt = performance.now();

    const query = this.getOrStartCheck();

    let timer: ReturnType<typeof setTimeout>
      | undefined;

    const timeout =
      new Promise<DatabaseHealthResult>(
        (resolve) => {
          timer = setTimeout(() => {
            resolve({
              status: 'down',
              latencyMs: Math.round(
                performance.now() - startedAt,
              ),
            });
          }, this.config.get(
            'DATABASE_HEALTH_TIMEOUT_MS',
          ));
        },
      );

    try {
      return await Promise.race([
        query,
        timeout,
      ]);
    } finally {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    }
  }

  private getOrStartCheck():
    Promise<DatabaseHealthResult> {
    if (!this.activeCheck) {
      this.activeCheck =
        this.executeCheck().finally(() => {
          this.activeCheck = undefined;
        });
    }

    return this.activeCheck;
  }

  private async executeCheck():
    Promise<DatabaseHealthResult> {
    const startedAt = performance.now();

    try {
      await this.prismaService.client
        .$queryRaw`SELECT 1`;

      return {
        status: 'up',
        latencyMs: Math.round(
          performance.now() - startedAt,
        ),
      };
    } catch {
      return {
        status: 'down',
        latencyMs: Math.round(
          performance.now() - startedAt,
        ),
      };
    }
  }
}
