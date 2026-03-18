import { ListRecord } from '@/models/list';
import { TaskMutationInput, TaskRecord } from '@/models/task';
import { cacheHomeState, queueTaskMutation } from '@/services/sync-service';
import { canViewList } from '@/utils/permissions';
import { SyncQueue } from '@/utils/sync-queue';

export type HomeVisibleScope = 'all' | 'shared' | 'mine';

type TaskRecordInput = Omit<Partial<TaskRecord>, 'isCompleted'> &
  Pick<TaskRecord, 'taskId' | 'listId' | 'title' | 'dueDateKey'> & {
    isCompleted?: boolean | number;
  };

export function normalizeTaskRecord(
  record: TaskRecordInput,
): TaskRecord {
  return {
    taskId: record.taskId,
    listId: record.listId,
    title: record.title,
    dueDateKey: record.dueDateKey,
    isCompleted: Boolean(record.isCompleted),
    assigneeUserIds: record.assigneeUserIds ?? [],
    createdBy: record.createdBy ?? '',
    updatedBy: record.updatedBy ?? '',
    createdAt: record.createdAt ?? '',
    updatedAt: record.updatedAt ?? '',
  };
}

export function filterMonthTasks(tasks: TaskRecord[], monthPrefix: string): TaskRecord[] {
  return tasks.filter((task) => task.dueDateKey.startsWith(monthPrefix));
}

export function filterTasksForHomeScope(input: {
  tasks: TaskRecord[];
  lists: Record<string, ListRecord>;
  scope: HomeVisibleScope;
  viewerUserId: string;
  viewerSpaceId: string | null;
}): TaskRecord[] {
  return input.tasks.filter((task) => {
    const list = input.lists[task.listId];

    if (!list) {
      return false;
    }

    const canSee = canViewList({
      viewerUserId: input.viewerUserId,
      listType: list.type,
      listOwnerUserId: list.ownerUserId,
      listSpaceId: list.spaceId,
      viewerSpaceId: input.viewerSpaceId,
    });

    if (!canSee) {
      return false;
    }

    if (input.scope === 'shared') {
      return list.type === 'shared';
    }

    if (input.scope === 'mine') {
      return list.type === 'private' && list.ownerUserId === input.viewerUserId;
    }

    return true;
  });
}

export async function upsertTask(input: TaskMutationInput): Promise<TaskRecord> {
  const response = await wx.cloud.callFunction({
    name: 'upsertTask',
    data: input,
  });

  return response.result as TaskRecord;
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean): Promise<TaskRecord> {
  const response = await wx.cloud.callFunction({
    name: 'toggleTaskCompletion',
    data: {
      taskId,
      isCompleted,
    },
  });

  return response.result as TaskRecord;
}

export async function toggleTaskCompletionWithOffline(input: {
  tasks: TaskRecord[];
  taskId: string;
  isCompleted: boolean;
  isOnline: boolean;
  queue: SyncQueue;
  monthKey: string;
  executeRemote: (taskId: string, isCompleted: boolean) => Promise<void>;
}): Promise<{ tasks: TaskRecord[]; queued: boolean }> {
  const updatedTasks = input.tasks.map((task) =>
    task.taskId === input.taskId
      ? {
          ...task,
          isCompleted: input.isCompleted,
        }
      : task,
  );

  cacheHomeState(`home-cache-${input.monthKey}`, {
    tasks: updatedTasks,
  });

  if (!input.isOnline) {
    queueTaskMutation(input.queue, {
      id: `toggle-${input.taskId}-${Date.now()}`,
      type: 'toggleTaskCompletion',
      payload: {
        taskId: input.taskId,
        isCompleted: input.isCompleted,
      },
    });

    return {
      tasks: updatedTasks,
      queued: true,
    };
  }

  await input.executeRemote(input.taskId, input.isCompleted);

  return {
    tasks: updatedTasks,
    queued: false,
  };
}
