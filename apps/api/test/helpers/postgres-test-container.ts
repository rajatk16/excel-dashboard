import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

const execFileAsync = promisify(execFile);

export interface PostgresTestContainer {
  container: StartedPostgreSqlContainer;

  databaseUrl: string;

  stop(): Promise<void>;
}

export async function startPostgresTestContainer(): Promise<PostgresTestContainer> {
  const container = await new PostgreSqlContainer('postgres:17-alpine')
    .withDatabase('excel_dashboard_test')
    .withUsername('test_user')
    .withPassword('test_password')
    .start();

  const databaseUrl = container.getConnectionUri();

  try {
    const prismaCli = require.resolve('prisma', {
      paths: [resolve(__dirname, '../../../../packages/database')],
    });

    const databasePackageDirectory = resolve(__dirname, '../../../../packages/database');

    await execFileAsync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
      cwd: databasePackageDirectory,

      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        DATABASE_DIRECT_URL: databaseUrl,
      },

      timeout: 120000,
    });

    return {
      container,
      databaseUrl,

      async stop(): Promise<void> {
        await container.stop();
      },
    };
  } catch (error) {
    await container.stop();

    throw error;
  }
}
