import { QueueEvents } from 'bullmq';
import type Redis from 'ioredis';

import type { QueueEnvironment } from '../config/queueEnvironment';
import {
  closeRedis,
  createRedisConnection,
} from '../connections/redisConnection';
import type { ActiveQueueName } from '../contracts/queueName';

export interface QueueEvent {
  queueName: ActiveQueueName;

  event:
    | 'completed'
    | 'failed'
    | 'stalled';

  jobId: string;
}

export interface QueueEventMonitorOptions {
  environment: QueueEnvironment;

  queueName: ActiveQueueName;

  applicationName: string;

  onEvent(event: QueueEvent): void;

  onError?: (error: Error) => void;
}

export class QueueEventMonitor {
  private readonly connection: Redis;

  private readonly events: QueueEvents;

  constructor(options: QueueEventMonitorOptions) {
    this.connection = createRedisConnection({
      environment: options.environment,

      role: 'events',

      connectionName: `${options.applicationName}-events`,
    });

    this.events = new QueueEvents(options.queueName, {
      connection: this.connection,

      prefix: options.environment.QUEUE_PREFIX,
    });

    this.events.on('error', (error: Error) => {
      options.onError?.(error);
    });

    this.events.on('completed', ({ jobId }) => {
      options.onEvent({
        queueName: options.queueName,

        event: 'completed',

        jobId,
      });
    });

    this.events.on('failed', ({ jobId }) => {
      options.onEvent({
        queueName: options.queueName,

        event: 'failed',

        jobId,
      });
    });

    this.events.on('stalled', ({ jobId }) => {
      options.onEvent({
        queueName: options.queueName,

        event: 'stalled',

        jobId,
      });
    });
  }

  async connect(): Promise<void> {
    await this.events.waitUntilReady();
  }

  async close(): Promise<void> {
    try {
      await this.events.close();
    } finally {
      await closeRedis(this.connection);
    }
  }
}
