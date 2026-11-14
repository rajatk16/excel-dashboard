import { type BeforeApplicationShutdown, Injectable, type OnModuleInit } from "@nestjs/common";

import type { AppConfigService } from "../../config/services/appConfig.service";

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
}

@Injectable()
export class HealthService implements OnModuleInit, BeforeApplicationShutdown {
  private ready = false;

  constructor(
    private readonly config: AppConfigService,
  ) {}

  onModuleInit() {
    this.ready = true;
  }

  beforeApplicationShutdown() {
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
    }
  }

  getLiveness(): LivenessStatus {
    return {
      status: 'ok'
    }
  }

  getReadiness(): ReadinessStatus {
    return {
      status: this.ready ? 'ready': 'not_ready'
    }
  }
}
