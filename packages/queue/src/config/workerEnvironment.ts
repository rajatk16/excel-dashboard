import z from "zod";

import { queueEnvironmentSchema } from "./queueEnvironment";

export const workerEnvironmentSchema = queueEnvironmentSchema.extend({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  WORKER_NAME: z.string().trim().min(1).max(100),
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(32).default(2),
  WORKER_HEALTH_HOST: z.string().min(1).default('127.0.0.1'),
  WORKER_HEALTH_PORT: z.coerce.number().int().min(1).max(65535),
  WORKER_LOCK_DURATION_MS: z.coerce.number().int().min(10000).max(300000).default(30000),
  WORKER_STALLED_INTERVAL_MS: z.coerce.number().int().min(5000).max(300000).default(30000),
  WORKER_MAX_STALLED_COUNT: z.coerce.number().int().min(0).max(5).default(1),
})

export type WorkerEnvironment = z.output<typeof workerEnvironmentSchema>;

export const validateWorkerEnvironment = (
  input: Record<string, unknown>
): WorkerEnvironment => {
  const result = workerEnvironmentSchema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');

    throw new Error(`Invalid worker configuration:\n${issues}`);
  }

  return result.data;
}
