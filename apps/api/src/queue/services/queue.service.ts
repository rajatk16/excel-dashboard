import {
  Injectable,
  Logger,
  type OnApplicationShutdown,
  type OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';

import {
  type ActiveJobName,
  type EnqueueResult,
  type JobPayload,
  QUEUE_ERROR_CODES,
  type QueueEnvironment,
  queueEnvironmentSchema,
  QueueError,
  QueueProducer,
} from '@excel-dashboard/queue';

import type { AppConfigService } from '../../config/services/appConfig.service';

export const getQueueEnvironment = (config: AppConfigService): QueueEnvironment =>
  queueEnvironmentSchema.parse({
    REDIS_URL: config.get('REDIS_URL'),
    QUEUE_PREFIX: config.get('QUEUE_PREFIX'),
    REDIS_CONNECT_TIMEOUT_MS: config.get('REDIS_CONNECT_TIMEOUT_MS'),
    REDIS_COMMAND_TIMEOUT_MS: config.get('REDIS_COMMAND_TIMEOUT_MS'),
    QUEUE_HEALTH_TIMEOUT_MS: config.get('QUEUE_HEALTH_TIMEOUT_MS'),
    QUEUE_SHUTDOWN_TIMEOUT_MS: config.get('QUEUE_SHUTDOWN_TIMEOUT_MS'),
    QUEUE_COMPLETED_RETENTION_SECONDS: config.get('QUEUE_COMPLETED_RETENTION_SECONDS'),
    QUEUE_COMPLETED_RETENTION_COUNT: config.get('QUEUE_COMPLETED_RETENTION_COUNT'),
    QUEUE_FAILED_RETENTION_SECONDS: config.get('QUEUE_FAILED_RETENTION_SECONDS'),
    QUEUE_FAILED_RETENTION_COUNT: config.get('QUEUE_FAILED_RETENTION_COUNT'),
  });

@Injectable()
export class QueueService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(QueueService.name);

  private readonly producer: QueueProducer;

  constructor(config: AppConfigService) {
    this.producer = new QueueProducer({
      environment: getQueueEnvironment(config),
      applicationName: config.applicationName,
      onError: () => {
        this.logger.error('Queue infrastructure error.');
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();

      this.logger.log('Queue producer initialized.');
    } catch {
      await this.producer.close().catch(() => undefined);

      throw new Error('Failed to initialize queue infrastructure.');
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.producer.close();

    this.logger.log('Queue producer closed.');
  }

  async enqueue<N extends ActiveJobName>(name: N, payload: JobPayload<N>): Promise<EnqueueResult> {
    try {
      return await this.producer.enqueue(name, payload);
    } catch (error) {
      if (
        error instanceof QueueError &&
        (error.code === QUEUE_ERROR_CODES.UNAVAILABLE || error.code === QUEUE_ERROR_CODES.CLOSED)
      ) {
        throw new ServiceUnavailableException({
          code: 'QUEUE_UNAVAILABLE',

          message: 'Background processing is temporarily unavailable.',
        });
      }

      throw error;
    }
  }
}
