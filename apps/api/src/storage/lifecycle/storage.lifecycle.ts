import { Inject, Injectable, Logger, type OnApplicationShutdown } from '@nestjs/common';

import type { StorageRuntime } from '@excel-dashboard/storage';

import { STORAGE_RUNTIME } from '../tokens/storage.tokens';

@Injectable()
export class StorageLifecycle implements OnApplicationShutdown {
  private readonly logger = new Logger(StorageLifecycle.name);

  constructor(
    @Inject(STORAGE_RUNTIME)
    private readonly runtime: StorageRuntime,
  ) {}

  onApplicationShutdown() {
    this.runtime.close();

    this.logger.log('Object storage connections closed.');
  }
}
