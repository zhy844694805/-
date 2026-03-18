import { ListRecord } from '@/models/list';
import { TaskRecord } from '@/models/task';
import { flushPendingOperations, rehydrateCachedHomeState } from '@/services/sync-service';
import { HomeStore } from '@/stores/home-store';
import { LocalDate } from '@/utils/date/local-date';
import { saveJson } from '@/utils/storage';
import { SyncQueue } from '@/utils/sync-queue';
import { toggleTaskCompletionWithOffline } from '@/services/task-service';

describe('offline sync integration', () => {
  const lists: Record<string, ListRecord> = {
    shared: {
      listId: 'shared',
      name: '共享',
      type: 'shared',
      ownerUserId: 'u1',
      spaceId: 'space-1',
      color: '#ddd',
      sortOrder: 1,
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
  };

  const tasks: TaskRecord[] = [
    {
      taskId: 'task-1',
      listId: 'shared',
      title: '共享任务',
      dueDateKey: '2026-03-18',
      isCompleted: false,
      assigneeUserIds: ['u1', 'u2'],
      createdBy: 'u1',
      updatedBy: 'u1',
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
  ];

  it('loads cached home data offline, updates locally, and flushes when back online', async () => {
    const queue = new SyncQueue('offline-sync-queue');
    queue.replaceAll([]);
    saveJson('home-cache-2026-03', { tasks, lists });

    const store = new HomeStore({
      today: new LocalDate(2026, 3, 18),
      viewerUserId: 'u1',
      viewerSpaceId: 'space-1',
      tasks: [],
      lists,
    });

    const cachedState = rehydrateCachedHomeState<{ tasks: TaskRecord[]; lists: Record<string, ListRecord> }>(
      'home-cache-2026-03',
    );

    store.setData(cachedState?.tasks ?? [], cachedState?.lists ?? {});

    expect(store.selectedDayTasks[0].isCompleted).toBe(false);

    const offlineResult = await toggleTaskCompletionWithOffline({
      tasks: store.visibleTasks,
      taskId: 'task-1',
      isCompleted: true,
      isOnline: false,
      queue,
      monthKey: '2026-03',
      executeRemote: async () => {},
    });

    store.setData(offlineResult.tasks, lists);

    expect(store.selectedDayTasks[0].isCompleted).toBe(true);
    expect(queue.peekAll()).toHaveLength(1);

    const replayedTaskIds: string[] = [];

    await flushPendingOperations(queue, async (item) => {
      replayedTaskIds.push(String((item.payload as { taskId: string }).taskId));
    });

    expect(replayedTaskIds).toEqual(['task-1']);
    expect(queue.peekAll()).toEqual([]);
  });
});
