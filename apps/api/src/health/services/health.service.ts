import {
  BeforeApplicationShutdown,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';

import {
  AppConfigService,
} from '../../config/services/appConfig.service';
import type { DatabaseHealthService } from '../../database/services/databaseHealth.service';

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
      uptimeSeconds: Math.floor(
        process.uptime(),
      ),
    };
  }

  getLiveness(): LivenessStatus {
    return {
      status: 'ok',
    };
  }

  async getReadiness():
    Promise<ReadinessStatus> {
    if (!this.ready) {
      return {
        status: 'not_ready',
        dependencies: {
          database: 'not_checked',
        },
      };
    }

    const database =
      await this.databaseHealthService.check();

    return {
      status:
        this.ready && database.status === 'up'
          ? 'ready'
          : 'not_ready',

      dependencies: {
        database: database.status,
      },
    };
  }
}
