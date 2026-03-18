import { loadJson } from '@/utils/storage';
import { SyncQueue, SyncQueueItem } from '@/utils/sync-queue';

export function queueTaskMutation(queue: SyncQueue, operation: SyncQueueItem): void {
  queue.enqueue(operation);
}

export async function flushPendingOperations(
  queue: SyncQueue,
  executor: (item: SyncQueueItem) => Promise<void>,
): Promise<void> {
  const pendingItems = queue.peekAll();
  const remainingItems: SyncQueueItem[] = [];

  for (let index = 0; index < pendingItems.length; index += 1) {
    const item = pendingItems[index];

    try {
      await executor(item);
    } catch (error) {
      remainingItems.push(...pendingItems.slice(index));
      queue.replaceAll(remainingItems);
      throw error;
    }
  }

  queue.replaceAll([]);
}

export function rehydrateCachedHomeState<T>(cacheKey: string): T | null {
  return loadJson<T>(cacheKey);
}
