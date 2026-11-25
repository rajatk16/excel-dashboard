import { Inject, Injectable } from '@nestjs/common';

import type { ObjectStorageService, StorageHealthResult } from '@excel-dashboard/storage';

import { OBJECT_STORAGE } from '../../storage/tokens/storage.tokens';

@Injectable()
export class StorageHealthIndicator {
  constructor(
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStorageService,
  ) {}

  check(): Promise<StorageHealthResult> {
    return this.storage.checkHealth();
  }
}
