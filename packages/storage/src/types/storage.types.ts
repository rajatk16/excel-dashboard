import type { Readable } from 'node:stream';

export interface StorageObjectReference {
  readonly bucket: string;
  readonly key: string;
}

export interface StorageObjectMetadata extends StorageObjectReference {
  readonly contentLength: number;
  readonly contentType: string | undefined;
  readonly etag: string | undefined;
  readonly lastModified: Date | undefined;
  readonly versionId: string | undefined;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface PutObjectInput {
  readonly key: string;
  readonly body: Buffer | Uint8Array | string;
  readonly contentType: string;
  readonly metadata?: Record<string, string>;
  readonly signal?: AbortSignal;
}

export interface MultipartUploadInput {
  readonly key: string;
  readonly body: Readable | Buffer | Uint8Array;
  readonly contentType: string;
  readonly contentLength?: number;
  readonly metadata?: Record<string, string>;
  readonly signal?: AbortSignal;
}

export interface StorageWriteResult extends StorageObjectReference {
  readonly etag: string | undefined;
  readonly versionId: string | undefined;
}

export interface StorageDownloadResult {
  readonly stream: Readable;
  readonly metadata: StorageObjectMetadata;
}

export interface PresignedUploadInput {
  readonly key: string;
  readonly contentType: string;
  readonly expiresIn?: number;
}

export interface PresignedDownloadInput {
  readonly key: string;
  readonly filename?: string;
  readonly expiresIn?: number;
}

export interface PresignedRequest {
  readonly url: string;
  readonly method: 'PUT' | 'GET';
  readonly headers: Readonly<Record<string, string>>;
  readonly expiresAt: Date;
}

export interface StorageHealthResult {
  readonly status: 'up' | 'down';
  readonly latencyMs: number;
  readonly checkedAt: string;
}
