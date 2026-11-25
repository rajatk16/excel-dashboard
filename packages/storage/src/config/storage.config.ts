import z from 'zod';

import { STORAGE_DEFAULTS, STORAGE_LIMITS } from '../constants/storage.constants';

const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
);

const optionalEndpoint = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.url({ protocol: /^https?$/ }).optional(),
);

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');

const bucketName = z
  .string()
  .min(3)
  .max(63)
  .regex(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/)
  .refine((value) => !value.includes('..'))
  .refine((value) => !/^\d+\.\d+\.\d+\.\d+$/.test(value));

export const storageEnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    S3_REGION: z.string().min(1).default(STORAGE_DEFAULTS.REGION),
    S3_BUCKET: bucketName,
    S3_ENDPOINT: optionalEndpoint,
    S3_PUBLIC_ENDPOINT: optionalEndpoint,
    S3_ACCESS_KEY_ID: optionalString,
    S3_SECRET_ACCESS_KEY: optionalString,
    S3_FORCE_PATH_STYLE: booleanString.prefault('false'),
    S3_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(STORAGE_DEFAULTS.MAX_ATTEMPTS),
    S3_CONNECTION_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(100)
      .default(STORAGE_DEFAULTS.CONNECTION_TIMEOUT_MS),
    S3_REQUEST_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1000)
      .default(STORAGE_DEFAULTS.REQUEST_TIMEOUT_MS),
    S3_MAX_SOCKETS: z.coerce.number().int().min(1).max(500).default(STORAGE_DEFAULTS.MAX_SOCKETS),
    S3_PRESIGNED_UPLOAD_TTL_SECONDS: z.coerce
      .number()
      .int()
      .min(1)
      .max(3600)
      .default(STORAGE_DEFAULTS.UPLOAD_TTL_SECONDS),
    S3_PRESIGNED_DOWNLOAD_TTL_SECONDS: z.coerce
      .number()
      .int()
      .min(1)
      .max(3600)
      .default(STORAGE_DEFAULTS.DOWNLOAD_TTL_SECONDS),
    S3_MULTIPART_PART_SIZE_BYTES: z.coerce
      .number()
      .int()
      .min(STORAGE_LIMITS.MIN_MULTIPART_PART_SIZE)
      .max(STORAGE_LIMITS.MAX_MULTIPART_PART_SIZE)
      .default(STORAGE_DEFAULTS.MULTIPART_PART_SIZE_BYTES),
    S3_MULTIPART_QUEUE_SIZE: z.coerce
      .number()
      .int()
      .min(1)
      .max(16)
      .default(STORAGE_DEFAULTS.MULTIPART_QUEUE_SIZE),
    S3_HEALTH_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(100)
      .max(30_000)
      .default(STORAGE_DEFAULTS.HEALTH_TIMEOUT_MS),
  })
  .superRefine((environment, context) => {
    const hasAccessKey = Boolean(environment.S3_ACCESS_KEY_ID);
    const hasSecretKey = Boolean(environment.S3_SECRET_ACCESS_KEY);

    if (hasAccessKey !== hasSecretKey) {
      context.addIssue({
        code: 'custom',
        path: ['S3_ACCESS_KEY_ID'],
        message: 'Both S3 credentials must be provided together.',
      });
    }

    for (const field of ['S3_ENDPOINT', 'S3_PUBLIC_ENDPOINT'] as const) {
      const value = environment[field];

      if (!value) {
        continue;
      }

      const url = new URL(value);

      if (url.username || url.password || url.search || url.hash || url.pathname !== '/') {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: 'S3 endpoint must be an origin without credentials or a path',
        });
      }

      if (environment.NODE_ENV === 'production' && url.protocol !== 'https:') {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: 'Production S3 endpoints must use HTTPS.',
        });
      }
    }
    if (environment.S3_PUBLIC_ENDPOINT && !environment.S3_ENDPOINT) {
      context.addIssue({
        code: 'custom',
        path: ['S3_PUBLIC_ENDPOINT'],
        message: 'A public endpoint requires an internal endpoint.',
      });
    }
  });

export interface StorageConfig {
  readonly region: string;
  readonly bucket: string;
  readonly endpoint: string | undefined;
  readonly publicEndpoint: string | undefined;
  readonly credentials:
    | {
        readonly accessKeyId: string;
        readonly secretAccessKey: string;
      }
    | undefined;
  readonly forcePathStyle: boolean;
  readonly maxAttempts: number;
  readonly connectionTimeoutMs: number;
  readonly requestTimeoutMs: number;
  readonly maxSockets: number;
  readonly uploadTtlSeconds: number;
  readonly downloadTtlSeconds: number;
  readonly multipartPartSizeBytes: number;
  readonly multipartQueueSize: number;
  readonly healthTimeoutMs: number;
}

export const loadStorageConfig = (input: Record<string, unknown> = process.env): StorageConfig => {
  const result = storageEnvironmentSchema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid storage configuration: ${issues}`);
  }

  const environment = result.data;

  const credentials =
    environment.S3_ACCESS_KEY_ID && environment.S3_SECRET_ACCESS_KEY
      ? Object.freeze({
          accessKeyId: environment.S3_ACCESS_KEY_ID,
          secretAccessKey: environment.S3_SECRET_ACCESS_KEY,
        })
      : undefined;

  return Object.freeze({
    region: environment.S3_REGION,
    bucket: environment.S3_BUCKET,
    endpoint: environment.S3_ENDPOINT,
    publicEndpoint: environment.S3_PUBLIC_ENDPOINT,
    credentials,
    forcePathStyle: environment.S3_FORCE_PATH_STYLE,
    maxAttempts: environment.S3_MAX_ATTEMPTS,
    connectionTimeoutMs: environment.S3_CONNECTION_TIMEOUT_MS,
    requestTimeoutMs: environment.S3_REQUEST_TIMEOUT_MS,
    maxSockets: environment.S3_MAX_SOCKETS,
    uploadTtlSeconds: environment.S3_PRESIGNED_UPLOAD_TTL_SECONDS,
    downloadTtlSeconds: environment.S3_PRESIGNED_DOWNLOAD_TTL_SECONDS,
    multipartPartSizeBytes: environment.S3_MULTIPART_PART_SIZE_BYTES,
    multipartQueueSize: environment.S3_MULTIPART_QUEUE_SIZE,
    healthTimeoutMs: environment.S3_HEALTH_TIMEOUT_MS,
  });
};
