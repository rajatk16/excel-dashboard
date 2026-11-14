import { z } from 'zod';

const booleanFromString = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const corsOriginsSchema = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(
    z.array(
      z.string().refine(
        (origin) => {
          try {
            const url = new URL(origin);

            return (
              ['http:', 'https:'].includes(url.protocol) &&
              url.origin === origin &&
              !url.username &&
              !url.password
            );
          } catch {
            return false;
          }
        },
        {
          message:
            'CORS origins must be exact HTTP or HTTPS origins without paths.',
        },
      ),
    ),
  )
  .transform((origins) => [...new Set(origins)]);

export const environmentSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    APP_NAME: z.string().trim().min(1).default('excel-dashboard-api'),

    APP_VERSION: z.string().trim().min(1).default('0.0.0'),

    API_HOST: z.string().trim().min(1).default('0.0.0.0'),

    API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),

    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),

    CORS_ORIGINS: corsOriginsSchema.prefault('http://localhost:3000'),

    CORS_CREDENTIALS: booleanFromString.prefault('false'),

    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(0),

    JSON_BODY_LIMIT_BYTES: z.coerce
      .number()
      .int()
      .min(1024)
      .max(10 * 1024 * 1024)
      .default(1024 * 1024),

    FORM_BODY_LIMIT_BYTES: z.coerce
      .number()
      .int()
      .min(1024)
      .max(1024 * 1024)
      .default(32 * 1024),

    FORM_PARAMETER_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .max(1000)
      .default(100),

    HTTP_REQUEST_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1000)
      .max(300000)
      .default(30000),

    HTTP_HEADERS_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1000)
      .max(60000)
      .default(15000),

    HTTP_KEEP_ALIVE_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1000)
      .max(60000)
      .default(5000),

    SHUTDOWN_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1000)
      .max(120000)
      .default(15000),
  })
  .superRefine((environment, context) => {
    if (
      environment.HTTP_HEADERS_TIMEOUT_MS >
      environment.HTTP_REQUEST_TIMEOUT_MS
    ) {
      context.addIssue({
        code: 'custom',
        path: ['HTTP_HEADERS_TIMEOUT_MS'],
        message:
          'Header timeout must not exceed the request timeout.',
      });
    }

    if (environment.NODE_ENV === 'production') {
      const insecureOrigins = environment.CORS_ORIGINS.filter(
        (origin) => !origin.startsWith('https://'),
      );

      if (insecureOrigins.length > 0) {
        context.addIssue({
          code: 'custom',
          path: ['CORS_ORIGINS'],
          message: 'Production CORS origins must use HTTPS.',
        });
      }
    }
  });

export type Environment = z.output<typeof environmentSchema>;

export const validateEnvironment = (
  configuration: Record<string, unknown>,
): Environment => {
  const result = environmentSchema.safeParse(configuration);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const path = issue.path.join('.') || 'environment';

        return `- ${path}: ${issue.message}`;
      })
      .join('\n');

    throw new Error(`Invalid API environment configuration:\n${issues}`);
  }

  return result.data;
}
