import { createHash } from 'node:crypto';

import type { JobName } from '../contracts/jobContract';

export interface JobIdentity {
  name: JobName;
  operationId: string;
  workspaceId?: string;
}

export const createJobId = (identity: JobIdentity): string => {
  const canonicalIdentity = JSON.stringify([
    identity.name,
    identity.workspaceId ?? 'system',
    identity.operationId,
  ]);

  const digest = createHash('sha256').update(canonicalIdentity).digest('hex');

  return `job-${digest}`;
};
