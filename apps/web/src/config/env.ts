import z from 'zod';

const environmentSchema = z.object({
  VITE_APP_NAME: z.string().trim().min(1),
  VITE_APP_ENV: z.enum(['development', 'test', 'staging', 'production']),
  VITE_API_BASE_URL: z
    .url({
      protocol: /^https?$/,
    })
    .transform((value) => value.replace(/\/+$/, '')),
});

export type AppEnvironment = z.infer<typeof environmentSchema>;

let cachedEnvironment: Readonly<AppEnvironment> | undefined;

export const getEnvironment = (): Readonly<AppEnvironment> => {
  if (cachedEnvironment) {
    return cachedEnvironment;
  }

  const result = environmentSchema.safeParse({
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  });

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => {
        const path = issue.path.join('.');

        return `${path}: ${issue.message}`;
      })
      .join('; ');

    throw new Error(`Invalid frontend environment configuration: ${details}`);
  }

  cachedEnvironment = Object.freeze(result.data);

  return cachedEnvironment;
};
