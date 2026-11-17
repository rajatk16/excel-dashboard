import 'dotenv/config';

import { validateWorkerEnvironment, type WorkerEnvironment } from '@excel-dashboard/queue';

export const getEnvironment = (): WorkerEnvironment => validateWorkerEnvironment({
  WORKER_NAME: 'excel-dashboard-ingestion-worker',
  WORKER_HEALTH_PORT: 4101,
  WORKER_CONCURRENCY: process.env.INGESTION_WORKER_CONCURRENCY ?? 2,
  ...process.env
})
