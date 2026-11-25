import z from 'zod';

import { STORAGE_LIMITS } from '../constants/storage.constants';

const identifierSchema = z.uuid();

const sourceExtensionSchema = z.enum(['xlsx', 'csv']);
const exportExtensionSchema = z.enum(['pdf', 'png', 'csv']);

export type SourceFileExtension = z.infer<typeof sourceExtensionSchema>;

export type ExportExtension = z.infer<typeof exportExtensionSchema>;

const identifier = (value: string): string => identifierSchema.parse(value).toLowerCase();

export const assertValidObjectKey = (key: string): void => {
  const segments = key.split('/');

  if (
    Buffer.byteLength(key, 'utf8') > STORAGE_LIMITS.MAX_OBJECT_KEY_BYTES ||
    segments.some(
      (segment) => segment === '.' || segment === '..' || !/^[a-zA-Z0-9._-]+$/.test(segment),
    )
  ) {
    throw new Error('Invalid storage object key.');
  }

  if (
    segments[0] !== 'workspaces' ||
    segments.length < 3 ||
    !identifierSchema.safeParse(segments[1]).success
  ) {
    throw new Error('Object key must belong to a workspace.');
  }
};

export const ObjectKeys = {
  workspacePrefix(workspaceId: string): string {
    return `workspaces/${identifier(workspaceId)}/`;
  },
  sourceFile(workspaceId: string, fileId: string, extension: SourceFileExtension): string {
    const safeExtension = sourceExtensionSchema.parse(extension);

    return (
      `${ObjectKeys.workspacePrefix(workspaceId)}` +
      `uploads/${identifier(fileId)}/original.${safeExtension}`
    );
  },
  datasetVersionPrefix(workspaceId: string, datasetId: string, versionId: string): string {
    return (
      `${ObjectKeys.workspacePrefix(workspaceId)}` +
      `datasets/${identifier(datasetId)}/` +
      `versions/${identifier(versionId)}/`
    );
  },
  datasetData(workspaceId: string, datasetId: string, versionId: string): string {
    return `${ObjectKeys.datasetVersionPrefix(workspaceId, datasetId, versionId)}data.parquet`;
  },
  datasetSchema(workspaceId: string, datasetId: string, versionId: string): string {
    return `${ObjectKeys.datasetVersionPrefix(workspaceId, datasetId, versionId)}schema.json`;
  },
  datasetProfile(workspaceId: string, datasetId: string, versionId: string): string {
    return `${ObjectKeys.datasetVersionPrefix(workspaceId, datasetId, versionId)}profile.json`;
  },
  queryResult(workspaceId: string, executionId: string): string {
    return (
      `${ObjectKeys.workspacePrefix(workspaceId)}` +
      `query-results/${identifier(executionId)}/result.parquet`
    );
  },
  dashboardExport(workspaceId: string, exportId: string, extension: ExportExtension): string {
    const safeExtension = exportExtensionSchema.parse(extension);

    return (
      `${ObjectKeys.workspacePrefix(workspaceId)}` +
      `exports/${identifier(exportId)}/dashboard.${safeExtension}`
    );
  },
  temporaryArtifact(workspaceId: string, jobId: string, artifactId: string): string {
    return (
      `${ObjectKeys.workspacePrefix(workspaceId)}` +
      `temporary/${identifier(jobId)}/${identifier(artifactId)}`
    );
  },
};

export const assertWorkspaceObjectKey = (workspaceId: string, key: string): void => {
  assertValidObjectKey(key);

  if (!key.startsWith(ObjectKeys.workspacePrefix(workspaceId))) {
    throw new Error('Object key does not belong to the workspace.');
  }
};
