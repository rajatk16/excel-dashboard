import z from 'zod';

const postgresUrlSchema = z.string().trim().min(1).refine((value) => {
  try {
    const url = new URL(value);

    return (
      ['postgres:', 'postgresql:'].includes(url.protocol) &&
      url.hostname.length > 0 &&
      url.pathname.length > 1
    )
  } catch  {
    return false;
  }
}, {
  message: 'A valid PostgresSQL connection URL is required.'
})

export const databaseEnvironmentSchema = z.object({
  DATABASE_URL: postgresUrlSchema,
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  DATABASE_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().min(1000).max(300000).default(30000),
  DATABASE_CONNECTION_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(5000),
  DATABASE_STATEMENT_TIMEOUT_MS: z.coerce.number().int().min(1000).max(300000).default(30000),
  DATABASE_LOCK_TIMEOUT_MS: z.coerce.number().int().min(100).max(60000).default(5000),
  DATABASE_IDLE_TRANSACTION_TIMEOUT_MS: z.coerce.number().int().min(1000).max(300000).default(15000),
  DATABASE_TRANSACTION_MAX_WAIT_MS: z.coerce.number().int().min(100).max(60000).default(5000),
  DATABASE_TRANSACTION_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(10000),
  DATABASE_HEALTH_TIMEOUT_MS: z.coerce.number().int().min(100).max(10000).default(2000),
})

export type DatabaseEnvironment = z.output<typeof databaseEnvironmentSchema>;

export const validateDatabaseEnvironment = (
  input: Record<string, unknown>
): DatabaseEnvironment => {
  const result = databaseEnvironmentSchema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => {
      const path = issue.path.join('.') || 'database';

      return `${path}: ${issue.message}`;
    }).join('\n');

    throw new Error(`Invalid database configuration:\n${issues}`);
  }

  return result.data;
}
