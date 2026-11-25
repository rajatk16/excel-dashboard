import 'dotenv/config';

import { createDatabaseClient } from '../src/client/databaseClient';
import { validateDatabaseEnvironment } from '../src/config/databaseEnvironment';

function assertSeedAllowed(): void {
  if (process.env.DATABASE_ALLOW_SEED !== 'true') {
    throw new Error('Database seeding requires DATABASE_ALLOW_SEED=true.');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development seeding is disabled in production.');
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for seeding.');
  }

  const url = new URL(databaseUrl);

  const allowedHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

  if (!allowedHosts.has(url.hostname) || url.pathname !== '/excel_dashboard') {
    throw new Error('Development seeding requires the local excel_dashboard database.');
  }
}

async function seed(): Promise<void> {
  assertSeedAllowed();

  const environment = validateDatabaseEnvironment(process.env);

  const handle = createDatabaseClient({
    environment,
    applicationName: 'excel-dashboard-seed',
  });

  try {
    await handle.connect();

    await handle.client.$transaction([
      handle.client.systemSetting.upsert({
        where: {
          key: 'platform.schema-version',
        },

        create: {
          key: 'platform.schema-version',
          value: {
            version: 1,
          },
        },

        update: {},
      }),

      handle.client.systemSetting.upsert({
        where: {
          key: 'platform.initialized',
        },

        create: {
          key: 'platform.initialized',
          value: true,
        },

        update: {},
      }),
    ]);

    process.stdout.write('Database seed completed successfully.\n');
  } finally {
    await handle.disconnect();
  }
}

void seed().catch(() => {
  process.stderr.write('Database seed failed. Check configuration and database availability.\n');

  process.exitCode = 1;
});
