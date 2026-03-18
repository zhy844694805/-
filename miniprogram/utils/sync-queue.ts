import { loadJson, saveJson } from '@/utils/storage';

export interface SyncQueueItem {
  id: string;
  type: string;
  payload?: unknown;
}

export class SyncQueue {
  constructor(private readonly storageKey = 'sync-queue') {}

  peekAll(): SyncQueueItem[] {
    return loadJson<SyncQueueItem[]>(this.storageKey) ?? [];
  }

  enqueue(item: SyncQueueItem): void {
    const currentItems = this.peekAll();
    currentItems.push(item);
    this.replaceAll(currentItems);
  }

  dequeue(): SyncQueueItem | undefined {
    const currentItems = this.peekAll();
    const nextItem = currentItems.shift();
    this.replaceAll(currentItems);
    return nextItem;
  }

  replaceAll(items: SyncQueueItem[]): void {
    saveJson(this.storageKey, items);
  }
}
