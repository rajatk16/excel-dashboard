import z from 'zod';

import { type ActiveQueueName,QUEUE_NAMES } from './queueName';

export const JOB_NAMES = {
  INGESTION_PROBE: 'ingestion.probe.v1',
  ANALYTICS_PROBE: 'analytics.probe.v1',

  INSPECT_FILE: 'file.inspect.v1',
  IMPORT_DATASET: 'dataset.import.v1',
  PROFILE_DATASET: 'dataset.profile.v1',

  EXECUTE_QUERY: 'query.execute.v1',
  EXPORT_DASHBOARD: 'dashboard.export.v1',
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];

const baseJobSchema = z.strictObject({
  schemaVersion: z.literal(1),
  operationId: z.uuid(),
  correlationId: z.string().min(1).max(150),
  requestedAt: z.iso.datetime()
});

const tenantJobSchema = baseJobSchema.extend({
  workspaceId: z.uuid(),
  requestedByUserId: z.uuid(),
});

export const probeJobSchema = baseJobSchema.extend({
  message: z.string().trim().min(1).max(200)
});

export const inspectFileJobSchema = tenantJobSchema.extend({
  sourceFileId: z.uuid(),
  importJobId: z.uuid()
});

export const importDatasetJobSchema = tenantJobSchema.extend({
  sourceFileId: z.uuid(),
  importJobId: z.uuid(),
  datasetId: z.uuid(),
  datasetVersionId: z.uuid(),
});

export const profileDatasetJobSchema = tenantJobSchema.extend({
  datasetId: z.uuid(),
  datasetVersionId: z.uuid(),
})

export const executeQueryJobSchema = tenantJobSchema.extend({
  queryExecutionId: z.uuid(),
  datasetId: z.uuid(),
  datasetVersion: z.uuid(),
})

export const exportDashboardJobSchema = tenantJobSchema.extend({
  exportId: z.uuid(),
  dashboardId: z.uuid(),
  dashboardRevisionId: z.uuid()
});

export const JOB_SCHEMAS = {
  [JOB_NAMES.INGESTION_PROBE]: probeJobSchema,
  [JOB_NAMES.ANALYTICS_PROBE]: probeJobSchema,
  [JOB_NAMES.INSPECT_FILE]: inspectFileJobSchema,
  [JOB_NAMES.IMPORT_DATASET]: importDatasetJobSchema,
  [JOB_NAMES.PROFILE_DATASET]: profileDatasetJobSchema,
  [JOB_NAMES.EXECUTE_QUERY]: executeQueryJobSchema,
  [JOB_NAMES.EXPORT_DASHBOARD]: exportDashboardJobSchema
}

export type JobPayload<N extends JobName> = z.output<(typeof JOB_SCHEMAS)[N]>;

export type ProbeJobPayload = z.output<typeof probeJobSchema>;

export interface ProbeJobResult {
  workerName: string;
  operationId: string;
  completedAt: string;
}

export const JOB_QUEUE_MAP = {
  [JOB_NAMES.INGESTION_PROBE]: QUEUE_NAMES.INGESTION_PROBE,
  [JOB_NAMES.ANALYTICS_PROBE]: QUEUE_NAMES.ANALYTICS_PROBE,
  [JOB_NAMES.INSPECT_FILE]: QUEUE_NAMES.FILE_INSPECTION,
  [JOB_NAMES.IMPORT_DATASET]: QUEUE_NAMES.DATASET_IMPORT,
  [JOB_NAMES.PROFILE_DATASET]: QUEUE_NAMES.DATASET_PROFILING,
  [JOB_NAMES.EXECUTE_QUERY]: QUEUE_NAMES.QUERY_EXECUTION,
  [JOB_NAMES.EXPORT_DASHBOARD]: QUEUE_NAMES.DASHBOARD_EXPORT,
}

export type ActiveJobName =
  | typeof JOB_NAMES.INGESTION_PROBE
  | typeof JOB_NAMES.ANALYTICS_PROBE;

export const ACTIVE_JOB_QUEUE_MAP = {
  [JOB_NAMES.INGESTION_PROBE]: QUEUE_NAMES.INGESTION_PROBE,
  [JOB_NAMES.ANALYTICS_PROBE]: QUEUE_NAMES.ANALYTICS_PROBE,
} satisfies Record<ActiveJobName, ActiveQueueName>

export const parseJobPayload = <N extends JobName>(
  name: N,
  payload: unknown,
): JobPayload<N> => JOB_SCHEMAS[name]?.parse(payload) as JobPayload<N>;
