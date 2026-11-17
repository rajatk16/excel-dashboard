import {
  JOB_NAMES,
  QUEUE_NAMES,
  runWorkerProcess,
} from '@excel-dashboard/queue';

import {
  getEnvironment,
} from './config/environment';
import {
  processProbeJob,
} from './processors/probe.processor';

const bootstrap = async (): Promise<void> => {
  const environment = getEnvironment();

  await runWorkerProcess({
    environment,

    queueName: QUEUE_NAMES.INGESTION_PROBE,

    jobName: JOB_NAMES.INGESTION_PROBE,

    processor: processProbeJob,
  });
}

void bootstrap().catch(() => {
  process.stderr.write(
    'Ingestion worker initialization failed.\n',
  );

  process.exitCode = 1;
});
