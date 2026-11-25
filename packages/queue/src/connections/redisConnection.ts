import Redis from 'ioredis';

import type { QueueEnvironment } from '../config/queueEnvironment';

export type RedisConnectionRole = 'producer' | 'worker' | 'events' | 'health';

export interface RedisConnectionOptions {
  environment: QueueEnvironment;

  role: RedisConnectionRole;

  connectionName: string;

  onError?: (error: Error) => void;
}

export const createRedisConnection = (options: RedisConnectionOptions): Redis => {
  const { environment, role, connectionName } = options;

  const blockingConnection = role === 'worker' || role === 'events';

  const connection = new Redis(environment.REDIS_URL, {
    connectionName,

    lazyConnect: true,

    connectTimeout: environment.REDIS_CONNECT_TIMEOUT_MS,

    maxRetriesPerRequest: blockingConnection ? null : 1,

    enableOfflineQueue: blockingConnection,

    enableReadyCheck: true,

    keepAlive: 10000,

    ...(blockingConnection
      ? {}
      : {
          commandTimeout: environment.REDIS_COMMAND_TIMEOUT_MS,
        }),

    retryStrategy(attempt: number): number {
      return Math.min(250 * 2 ** Math.min(attempt - 1, 5), 5000);
    },
  });

  connection.on('error', (error: Error) => {
    options.onError?.(error);
  });

  return connection;
};

export const connectRedis = async (connection: Redis): Promise<void> => {
  if (connection.status === 'wait') {
    await connection.connect();
  }

  if (connection.status !== 'ready') {
    throw new Error('Redis connection is not ready.');
  }

  await connection.ping();
};

export async function closeRedis(connection: Redis): Promise<void> {
  if (connection.status === 'end') {
    return;
  }

  if (connection.status !== 'ready') {
    connection.disconnect();
    return;
  }

  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      connection.quit(),

      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('Redis shutdown timed out.'));
        }, 3000);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }

    connection.disconnect();
  }
}
