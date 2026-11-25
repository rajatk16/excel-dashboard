import { Readable } from 'node:stream';

import type { S3Client } from '@aws-sdk/client-s3';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { StorageConfig } from '../config/storage.config';
import { STORAGE_CONTENT_TYPES, STORAGE_LIMITS } from '../constants/storage.constants';
import { normalizeStorageError, STORAGE_ERROR_CODES, StorageError } from '../errors/storage.error';
import { assertValidObjectKey } from '../keys/objectKeys';
import type {
  MultipartUploadInput,
  PresignedDownloadInput,
  PresignedRequest,
  PresignedUploadInput,
  PutObjectInput,
  StorageDownloadResult,
  StorageHealthResult,
  StorageObjectMetadata,
  StorageWriteResult,
} from '../types/storage.types';

function validateExpiration(expiresIn: number, maximum: number): number {
  if (!Number.isInteger(expiresIn) || expiresIn < 1 || expiresIn > maximum) {
    throw new StorageError(
      STORAGE_ERROR_CODES.INVALID_REQUEST,
      'Invalid presigned URL expiration.',
      false,
    );
  }

  return expiresIn;
}

function createContentDisposition(filename: string): string {
  const safeName =
    [...filename]
      .filter((character) => {
        const codeUnit = character.charCodeAt(0);

        return codeUnit >= 0x20 && codeUnit !== 0x7f;
      })
      .join('')
      .replace(/[/\\]/g, '_')
      .slice(0, 180) || 'download';

  const fallback = safeName.replace(/[^a-zA-Z0-9._ -]/g, '_');

  const encoded = encodeURIComponent(Buffer.from(safeName, 'utf8').toString('utf8')).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

export class ObjectStorageService {
  constructor(
    private readonly client: S3Client,
    private readonly signingClient: S3Client,
    private readonly config: StorageConfig,
  ) {}

  private async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw normalizeStorageError(error);
    }
  }

  async putObject(input: PutObjectInput): Promise<StorageWriteResult> {
    assertValidObjectKey(input.key);

    const contentLength =
      typeof input.body === 'string' ? Buffer.byteLength(input.body) : input.body.byteLength;

    if (contentLength > STORAGE_LIMITS.MAX_SINGLE_PUT_SIZE) {
      throw new StorageError(
        STORAGE_ERROR_CODES.LIMIT_EXCEEDED,
        'Object exceeds the single-upload size limit.',
        false,
      );
    }

    return this.execute(async () => {
      const result = await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: input.key,
          Body: input.body,
          ContentType: input.contentType,
          ContentLength: contentLength,
          ...(input.metadata ? { Metadata: input.metadata } : {}),
        }),
        input.signal ? { abortSignal: input.signal } : undefined,
      );

      return {
        bucket: this.config.bucket,
        key: input.key,
        etag: result.ETag,
        versionId: result.VersionId,
      };
    });
  }

  async putJson(key: string, value: unknown, signal?: AbortSignal): Promise<StorageWriteResult> {
    const body = JSON.stringify(value);

    if (body === undefined) {
      throw new StorageError(
        STORAGE_ERROR_CODES.INVALID_REQUEST,
        'Value cannot be serialized as JSON.',
        false,
      );
    }

    return this.putObject({
      key,
      body,
      contentType: STORAGE_CONTENT_TYPES.JSON,
      ...(signal ? { signal } : {}),
    });
  }

  async uploadMultipart(input: MultipartUploadInput): Promise<StorageWriteResult> {
    assertValidObjectKey(input.key);

    return this.execute(async () => {
      input.signal?.throwIfAborted();

      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.config.bucket,
          Key: input.key,
          Body: input.body,
          ContentType: input.contentType,
          ...(input.contentLength !== undefined ? { ContentLength: input.contentLength } : {}),
          ...(input.metadata ? { Metadata: input.metadata } : {}),
        },
        queueSize: this.config.multipartQueueSize,
        partSize: this.config.multipartPartSizeBytes,
        leavePartsOnError: false,
      });

      const abort = (): void => {
        void upload.abort().catch(() => undefined);
      };

      input.signal?.addEventListener('abort', abort, {
        once: true,
      });

      if (input.signal?.aborted) {
        abort();
      }

      try {
        const result = await upload.done();

        return {
          bucket: this.config.bucket,
          key: input.key,
          etag: result.ETag,
          versionId: result.VersionId,
        };
      } finally {
        input.signal?.removeEventListener('abort', abort);
      }
    });
  }

  async headObject(key: string, signal?: AbortSignal): Promise<StorageObjectMetadata> {
    assertValidObjectKey(key);

    return this.execute(async () => {
      const result = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        }),
        signal ? { abortSignal: signal } : undefined,
      );

      return {
        bucket: this.config.bucket,
        key,
        contentLength: result.ContentLength ?? 0,
        contentType: result.ContentType,
        etag: result.ETag,
        lastModified: result.LastModified,
        versionId: result.VersionId,
        metadata: result.Metadata ?? {},
      };
    });
  }

  async exists(key: string, signal?: AbortSignal): Promise<boolean> {
    try {
      await this.headObject(key, signal);
      return true;
    } catch (error) {
      if (error instanceof StorageError && error.code === STORAGE_ERROR_CODES.NOT_FOUND) {
        return false;
      }

      throw error;
    }
  }

  async getObject(key: string, signal?: AbortSignal): Promise<StorageDownloadResult> {
    assertValidObjectKey(key);

    return this.execute(async () => {
      const result = await this.client.send(
        new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        }),
        signal ? { abortSignal: signal } : undefined,
      );

      if (!(result.Body instanceof Readable)) {
        throw new StorageError(
          STORAGE_ERROR_CODES.UNKNOWN,
          'Object storage returned an invalid stream.',
          false,
        );
      }

      return {
        stream: result.Body,
        metadata: {
          bucket: this.config.bucket,
          key,
          contentLength: result.ContentLength ?? 0,
          contentType: result.ContentType,
          etag: result.ETag,
          lastModified: result.LastModified,
          versionId: result.VersionId,
          metadata: result.Metadata ?? {},
        },
      };
    });
  }

  async getBuffer(
    key: string,
    maxBytes = STORAGE_LIMITS.DEFAULT_BUFFER_LIMIT_BYTES,
    signal?: AbortSignal,
  ): Promise<Buffer> {
    if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
      throw new StorageError(
        STORAGE_ERROR_CODES.INVALID_REQUEST,
        'Invalid download buffer limit.',
        false,
      );
    }

    const { stream, metadata } = await this.getObject(key, signal);

    try {
      if (metadata.contentLength > maxBytes) {
        throw new StorageError(
          STORAGE_ERROR_CODES.LIMIT_EXCEEDED,
          'Object exceeds the download buffer limit.',
          false,
        );
      }

      const chunks: Buffer[] = [];
      let totalBytes = 0;

      for await (const chunk of stream as AsyncIterable<unknown>) {
        if (!(chunk instanceof Uint8Array)) {
          throw new StorageError(
            STORAGE_ERROR_CODES.UNKNOWN,
            'Invalid storage stream chunk.',
            false,
          );
        }

        const buffer = Buffer.from(chunk);

        totalBytes += buffer.byteLength;

        if (totalBytes > maxBytes) {
          throw new StorageError(
            STORAGE_ERROR_CODES.LIMIT_EXCEEDED,
            'Object exceeds the download buffer limit.',
            false,
          );
        }

        chunks.push(buffer);
      }

      return Buffer.concat(chunks, totalBytes);
    } catch (error) {
      throw normalizeStorageError(error);
    } finally {
      stream.destroy();
    }
  }

  async getJson<T>(key: string, parse: (value: unknown) => T, maxBytes?: number): Promise<T> {
    const buffer = await this.getBuffer(key, maxBytes);

    const value: unknown = JSON.parse(buffer.toString('utf8'));

    return parse(value);
  }

  async deleteObject(key: string, signal?: AbortSignal): Promise<void> {
    assertValidObjectKey(key);

    await this.execute(async () => {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        }),
        signal ? { abortSignal: signal } : undefined,
      );
    });
  }

  async createPresignedUpload(input: PresignedUploadInput): Promise<PresignedRequest> {
    assertValidObjectKey(input.key);

    const expiresIn = validateExpiration(
      input.expiresIn ?? this.config.uploadTtlSeconds,
      this.config.uploadTtlSeconds,
    );

    const signingDate = new Date();

    const url = await this.execute(() =>
      getSignedUrl(
        this.signingClient,
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: input.key,
          ContentType: input.contentType,
        }),
        {
          expiresIn,
          signingDate,
          signableHeaders: new Set(['content-type']),
        },
      ),
    );

    return {
      url,
      method: 'PUT',
      headers: {
        'Content-Type': input.contentType,
      },
      expiresAt: new Date(signingDate.getTime() + expiresIn * 1000),
    };
  }

  async createPresignedDownload(input: PresignedDownloadInput): Promise<PresignedRequest> {
    assertValidObjectKey(input.key);

    const expiresIn = validateExpiration(
      input.expiresIn ?? this.config.downloadTtlSeconds,
      this.config.downloadTtlSeconds,
    );

    const signingDate = new Date();

    const url = await this.execute(() =>
      getSignedUrl(
        this.signingClient,
        new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: input.key,
          ...(input.filename
            ? {
                ResponseContentDisposition: createContentDisposition(input.filename),
              }
            : {}),
        }),
        {
          expiresIn,
          signingDate,
        },
      ),
    );

    return {
      url,
      method: 'GET',
      headers: {},
      expiresAt: new Date(signingDate.getTime() + expiresIn * 1000),
    };
  }

  async checkHealth(): Promise<StorageHealthResult> {
    const startedAt = performance.now();

    try {
      await this.client.send(
        new HeadBucketCommand({
          Bucket: this.config.bucket,
        }),
        {
          abortSignal: AbortSignal.timeout(this.config.healthTimeoutMs),
        },
      );

      return {
        status: 'up',
        latencyMs: Math.round(performance.now() - startedAt),
        checkedAt: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'down',
        latencyMs: Math.round(performance.now() - startedAt),
        checkedAt: new Date().toISOString(),
      };
    }
  }
}
