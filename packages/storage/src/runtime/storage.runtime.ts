import { createS3Client } from '../client/s3ClientFactory';
import type { StorageConfig } from '../config/storage.config';
import { ObjectStorageService } from '../services/objectStorage.service';

export interface StorageRuntime {
  readonly storage: ObjectStorageService;
  close(): void;
}

export const createStorageRuntime = (config: StorageConfig): StorageRuntime => {
  const client = createS3Client(config);

  const signingClient =
    config.publicEndpoint && config.publicEndpoint !== config.endpoint
      ? createS3Client(config, config.publicEndpoint)
      : client;

  const storage = new ObjectStorageService(client, signingClient, config);

  let closed = false;

  return {
    storage,
    close(): void {
      if (closed) return;

      closed = true;

      try {
        client.destroy();
      } finally {
        if (signingClient !== client) {
          signingClient.destroy();
        }
      }
    },
  };
};
