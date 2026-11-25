import { Agent as HttpAgent } from 'node:http';
import { Agent as HttpsAgent } from 'node:https';

import type { S3ClientConfig } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';

import type { StorageConfig } from '../config/storage.config';

export const createS3Client = (config: StorageConfig, endpoint = config.endpoint): S3Client => {
  const requestHandler = new NodeHttpHandler({
    connectionTimeout: config.connectionTimeoutMs,
    requestTimeout: config.requestTimeoutMs,
    httpAgent: new HttpAgent({
      keepAlive: true,
      maxSockets: config.maxSockets,
    }),
    httpsAgent: new HttpsAgent({
      keepAlive: true,
      maxSockets: config.maxSockets,
    }),
  });

  const clientConfig: S3ClientConfig = {
    region: config.region,
    forcePathStyle: config.forcePathStyle,
    maxAttempts: config.maxAttempts,
    retryMode: 'standard',
    requestHandler,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    ...(endpoint ? { endpoint } : {}),
    ...(config.credentials ? { credentials: config.credentials } : {}),
  };

  return new S3Client(clientConfig);
};
