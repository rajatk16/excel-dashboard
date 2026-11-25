import {
  createStorageRuntime,
  loadStorageConfig,
  type StorageRuntime,
} from '@excel-dashboard/storage';

export const initializeStorage = async (): Promise<StorageRuntime> => {
  const runtime = createStorageRuntime(loadStorageConfig());

  try {
    const health = await runtime.storage.checkHealth();

    if (health.status !== 'up') {
      throw new Error('Analytics worker object is unavailable.');
    }

    return runtime;
  } catch (error) {
    runtime.close();

    throw error;
  }
};
