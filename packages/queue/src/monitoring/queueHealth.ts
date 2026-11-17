import type Redis from 'ioredis';

import type { QueueEnvironment } from '../config/queueEnvironment';
import {
  closeRedis,
  connectRedis,
  createRedisConnection,
} from '../connections/redisConnection';

export interface QueueHealthResult {
  status: 'up' | 'down';

  latencyMs: number;
}

export class QueueHealth {
  private readonly connection: Redis;

  private activeCheck: Promise<QueueHealthResult> | undefined;

  constructor(
    private readonly environment: QueueEnvironment,

    applicationName: string,
  ) {
    this.connection = createRedisConnection({
      environment,

      role: 'health',

      connectionName: `${applicationName}-health`,
    });
  }

  async connect(): Promise<void> {
    await connectRedis(this.connection);
  }

  async check(): Promise<QueueHealthResult> {
    const startedAt = performance.now();

    const query = this.getOrStartCheck();

    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
      return await Promise.race([
        query,

        new Promise<QueueHealthResult>((resolve) => {
          timer = setTimeout(() => {
            resolve({
              status: 'down',

              latencyMs: Math.round(
                performance.now() - startedAt,
              ),
            });
          }, this.environment.QUEUE_HEALTH_TIMEOUT_MS);
        }),
      ]);
    } finally {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    }
  }

  async close(): Promise<void> {
    await closeRedis(this.connection);
  }

  private getOrStartCheck(): Promise<QueueHealthResult> {
    this.activeCheck ??= this.executeCheck().finally(() => {
      this.activeCheck = undefined;
    });

    return this.activeCheck;
  }

  private async executeCheck(): Promise<QueueHealthResult> {
    const startedAt = performance.now();

    try {
      if (this.connection.status !== 'ready') {
        throw new Error('Redis is unavailable.');
      }

      const response = await this.connection.ping();

      return {
        status: response === 'PONG' ? 'up' : 'down',

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
