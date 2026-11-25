import 'dotenv/config';

import { randomUUID } from 'node:crypto';

import {
  ACTIVE_QUEUE_NAMES,
  isActiveQueueName,
  JOB_NAMES,
  QUEUE_NAMES,
  QueueAdministration,
  QueueProducer,
  validateQueueEnvironment,
} from '../src';

function print(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function assertMutationAllowed(): void {
  if (process.env.QUEUE_ADMIN_ALLOW_MUTATIONS !== 'true') {
    throw new Error('Queue mutations require explicit opt-in.');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('This development CLI is disabled in production.');
  }

  const url = new URL(process.env.REDIS_URL ?? '');

  if (
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    process.env.QUEUE_PREFIX !== 'excel-dashboard-local'
  ) {
    throw new Error('Queue mutations require the local Redis environment.');
  }
}

async function main(): Promise<void> {
  const [command, queueName, argument] = process.argv.slice(2);

  const environment = validateQueueEnvironment(process.env);

  const producer = new QueueProducer({
    environment,

    applicationName: 'queue-admin',
  });

  const administration = new QueueAdministration(producer);

  try {
    await producer.connect();

    if (!command) {
      throw new Error('A queue administration command is required.');
    }

    if (command === 'stats' && !queueName) {
      for (const name of ACTIVE_QUEUE_NAMES) {
        print({
          queueName: name,

          statistics: await administration.getStatistics(name),
        });
      }

      return;
    }

    if (!queueName || !isActiveQueueName(queueName)) {
      throw new Error('A valid active queue name is required.');
    }

    switch (command) {
      case 'stats': {
        print(await administration.getStatistics(queueName));

        return;
      }

      case 'failed': {
        print(await administration.listFailedJobs(queueName));

        return;
      }

      case 'retry': {
        assertMutationAllowed();

        if (!argument) {
          throw new Error('A job ID is required.');
        }

        await administration.retryFailedJob(queueName, argument);

        print({
          retried: true,

          jobId: argument,
        });

        return;
      }

      case 'probe': {
        assertMutationAllowed();

        const name =
          queueName === QUEUE_NAMES.INGESTION_PROBE
            ? JOB_NAMES.INGESTION_PROBE
            : JOB_NAMES.ANALYTICS_PROBE;

        const operationId = argument ?? randomUUID();

        const result = await producer.enqueue(name, {
          schemaVersion: 1,

          operationId,

          correlationId: randomUUID(),

          requestedAt: new Date().toISOString(),

          message: 'Queue infrastructure probe',
        });

        print(result);

        return;
      }

      default:
        throw new Error('Unsupported queue administration command.');
    }
  } finally {
    await producer.close();
  }
}

void main().catch(() => {
  process.stderr.write(
    'Queue administration command failed. Verify arguments and configuration.\n',
  );

  process.exitCode = 1;
});
