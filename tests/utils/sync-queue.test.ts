import { flushPendingOperations, rehydrateCachedHomeState } from '@/services/sync-service';
import { saveJson } from '@/utils/storage';
import { SyncQueue } from '@/utils/sync-queue';

describe('sync queue', () => {
  it('replays queued operations in insertion order', () => {
    const queue = new SyncQueue('test-queue-order');

    queue.replaceAll([]);
    queue.enqueue({ id: '1', type: 'toggleTaskCompletion' });
    queue.enqueue({ id: '2', type: 'upsertTask' });

    expect(queue.peekAll().map((item) => item.id)).toEqual(['1', '2']);
  });

  it('keeps failed operations in the queue', async () => {
    const queue = new SyncQueue('test-queue-failure');

    queue.replaceAll([
      { id: '1', type: 'toggleTaskCompletion' },
      { id: '2', type: 'upsertTask' },
    ]);

    await expect(
      flushPendingOperations(queue, async (item) => {
        if (item.id === '1') {
          throw new Error('network down');
        }
      }),
    ).rejects.toThrow('network down');

    expect(queue.peekAll().map((item) => item.id)).toEqual(['1', '2']);
  });

  it('removes successful operations from the queue', async () => {
    const queue = new SyncQueue('test-queue-success');

    queue.replaceAll([
      { id: '1', type: 'toggleTaskCompletion' },
      { id: '2', type: 'upsertTask' },
    ]);

    await flushPendingOperations(queue, async () => {});

    expect(queue.peekAll()).toEqual([]);
  });

  it('round-trips cached month data through storage', () => {
    saveJson('home-cache-2026-03', {
      monthKey: '2026-03',
      taskIds: ['task-1', 'task-2'],
    });

    expect(rehydrateCachedHomeState('home-cache-2026-03')).toEqual({
      monthKey: '2026-03',
      taskIds: ['task-1', 'task-2'],
    });
  });
});
