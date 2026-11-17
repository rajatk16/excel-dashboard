import type {
  JobExecutionContext,
  ProbeJobPayload,
  ProbeJobResult,
} from '@excel-dashboard/queue';

export const processProbeJob = async (
  payload: ProbeJobPayload,

  context: JobExecutionContext,
): Promise<ProbeJobResult> => {
  await context.updateProgress(50);

  const result: ProbeJobResult = {
    workerName: context.workerName,

    operationId: payload.operationId,

    completedAt: new Date().toISOString(),
  };

  await context.updateProgress(100);

  return result;
}
