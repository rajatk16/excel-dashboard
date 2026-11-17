export const QUEUE_NAMES = {
  INGESTION_PROBE: 'ingestion-probe',
  ANALYTICS_PROBE: 'analytics-probe',

  FILE_INSPECTION: 'file-inspection',
  DATASET_IMPORT: 'dataset-import',
  DATASET_PROFILING: 'dataset-profiling',

  QUERY_EXECUTION: 'query-execution',
  DASHBOARD_EXPORT: 'dashboard-export',

  NOTIFICATIONS: 'notifications',
  CLEANUP: 'cleanup',
  USAGE_METERING: 'usage-metering',
} as const;

export type QueueName =
  (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const ACTIVE_QUEUE_NAMES = [
  QUEUE_NAMES.INGESTION_PROBE,
  QUEUE_NAMES.ANALYTICS_PROBE,
] as const;

export type ActiveQueueName =
  (typeof ACTIVE_QUEUE_NAMES)[number];

export const isActiveQueueName = (
  value: string,
): value is ActiveQueueName => ACTIVE_QUEUE_NAMES.some((queueName) => queueName === value);
