import 'dotenv/config';

import {
  validateWorkerEnvironment,
  type WorkerEnvironment,
} from '@excel-dashboard/queue';

export const getEnvironment = (): WorkerEnvironment => validateWorkerEnvironment({
  WORKER_NAME: 'excel-dashboard-analytics-worker',

  WORKER_HEALTH_PORT: 4102,

  WORKER_CONCURRENCY:
    process.env.ANALYTICS_WORKER_CONCURRENCY ?? 2,

  ...process.env,
});
