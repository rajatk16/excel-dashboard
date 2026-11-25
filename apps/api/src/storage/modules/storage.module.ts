import { Module } from '@nestjs/common';

import {
  createStorageRuntime,
  loadStorageConfig,
  type ObjectStorageService,
  type StorageRuntime,
} from '@excel-dashboard/storage';

import { StorageLifecycle } from '../lifecycle/storage.lifecycle';
import { OBJECT_STORAGE, STORAGE_RUNTIME } from '../tokens/storage.tokens';

@Module({
  providers: [
    {
      provide: STORAGE_RUNTIME,
      useFactory: (): StorageRuntime => {
        const config = loadStorageConfig();

        return createStorageRuntime(config);
      },
    },
    {
      provide: OBJECT_STORAGE,
      inject: [STORAGE_RUNTIME],
      useFactory: (runtime: StorageRuntime): ObjectStorageService => runtime.storage,
    },
    StorageLifecycle,
  ],
  exports: [OBJECT_STORAGE],
})
export class StorageModule {}
