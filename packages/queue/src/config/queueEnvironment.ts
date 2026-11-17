import z from 'zod';

const redisUrlSchema = z.string().trim().refine((value) => {
  try {
    const url = new URL(value);

    return (
      ['redis:', 'rediss:'].includes(url.protocol) && url.hostname.length > 0
    );
  } catch {
    return false;
  }
}, {
  message: 'A valid Redis connection URL is required.'
});

export const queueEnvironmentSchema = z.object({
  REDIS_URL: redisUrlSchema,
  QUEUE_PREFIX: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9_-]+$/).default('excel-dashboard-local'),
  REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().min(500).max(60000).default(5000),
  REDIS_COMMAND_TIMEOUT_MS: z.coerce.number().int().min(100).max(60000).default(3000),
  QUEUE_HEALTH_TIMEOUT_MS: z.coerce.number().int().min(100).max(10000).default(20000),
  QUEUE_SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(5000).max(300000).default(300000),
  QUEUE_COMPLETED_RETENTION_SECONDS: z.coerce.number().int().min(60).max(2592000).default(86400),
  QUEUE_COMPLETED_RETENTION_COUNT: z.coerce.number().int().min(100).max(1000000).default(10000),
  QUEUE_FAILED_RETENTION_SECONDS: z.coerce.number().int().min(60).max(7776000).default(604800),
  QUEUE_FAILED_RETENTION_COUNT: z.coerce.number().int().min(100).max(1000000).default(50000),
})

export type QueueEnvironment = z.output<typeof queueEnvironmentSchema>;

export const validateQueueEnvironment = (
  input: Record<string,unknown>
): QueueEnvironment => {
  const result = queueEnvironmentSchema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');

    throw new Error(`Invalid queue configuration:\n${issues}`);
  }

  return result.data;
}
