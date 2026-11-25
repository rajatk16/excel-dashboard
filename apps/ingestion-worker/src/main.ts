import { JOB_NAMES, QUEUE_NAMES, runWorkerProcess } from '@excel-dashboard/queue';
import type { StorageRuntime } from '@excel-dashboard/storage';

import { getEnvironment } from './config/environment';
import { initializeStorage } from './infrastructure/storage';
import { processProbeJob } from './processors/probe.processor';

const bootstrap = async (): Promise<void> => {
  let storageRuntime: StorageRuntime | undefined;
  const environment = getEnvironment();
  try {
    storageRuntime = await initializeStorage();
    await runWorkerProcess({
      environment,
      queueName: QUEUE_NAMES.INGESTION_PROBE,
      jobName: JOB_NAMES.INGESTION_PROBE,
      processor: processProbeJob,
    });
  } catch {
    storageRuntime?.close();
  }
};

void bootstrap().catch(() => {
  process.stderr.write('Ingestion worker initialization failed.\n');

  process.exitCode = 1;
});
