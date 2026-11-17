import {
  BeforeApplicationShutdown,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';

import type { AppConfigService } from '../../config/services/appConfig.service';
import type { DatabaseHealthService } from '../../database/services/databaseHealth.service';
import type { QueueHealthService } from '../../queue/services/queueHealth.service';

export interface HealthStatus {
  status: 'ok';

  service: string;

  version: string;

  timestamp: string;

  uptimeSeconds: number;
}

export interface LivenessStatus {
  status: 'ok';
}

export interface ReadinessStatus {
  status: 'ready' | 'not_ready';

  dependencies: {
    database: 'up' | 'down' | 'not_checked';

    redis: 'up' | 'down' | 'not_checked';
  };
}

@Injectable()
export class HealthService
  implements
    OnApplicationBootstrap,
    BeforeApplicationShutdown
{
  private ready = false;

  constructor(
    private readonly config: AppConfigService,

    private readonly databaseHealthService:
      DatabaseHealthService,

    private readonly queueHealthService:
      QueueHealthService,
  ) {}

  onApplicationBootstrap(): void {
    this.ready = true;
  }

  beforeApplicationShutdown(): void {
    this.markNotReady();
  }

  markNotReady(): void {
    this.ready = false;
  }

  getHealth(): HealthStatus {
    return {
      status: 'ok',

      service: this.config.applicationName,

      version: this.config.applicationVersion,

      timestamp: new Date().toISOString(),

      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  getLiveness(): LivenessStatus {
    return {
      status: 'ok',
    };
  }

  async getReadiness(): Promise<ReadinessStatus> {
    if (!this.ready) {
      return {
        status: 'not_ready',

        dependencies: {
          database: 'not_checked',

          redis: 'not_checked',
        },
      };
    }

    const [database, redis] = await Promise.all([
      this.databaseHealthService.check(),

      this.queueHealthService.check(),
    ]);

    return {
      status:
        this.ready &&
        database.status === 'up' &&
        redis.status === 'up'
          ? 'ready'
          : 'not_ready',

      dependencies: {
        database: database.status,

        redis: redis.status,
      },
    };
  }
}
