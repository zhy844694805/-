import { ListRecord } from '@/models/list';
import { TaskRecord } from '@/models/task';
import { filterMonthTasks, filterTasksForHomeScope, normalizeTaskRecord } from '@/services/task-service';

describe('task-service', () => {
  const lists: Record<string, ListRecord> = {
    'list-shared': {
      listId: 'list-shared',
      name: '共享',
      type: 'shared',
      ownerUserId: 'u1',
      spaceId: 'space-1',
      color: '#eee',
      sortOrder: 1,
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
    'list-mine': {
      listId: 'list-mine',
      name: '我的',
      type: 'private',
      ownerUserId: 'u1',
      spaceId: null,
      color: '#ddd',
      sortOrder: 2,
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
    'list-partner': {
      listId: 'list-partner',
      name: '对方',
      type: 'private',
      ownerUserId: 'u2',
      spaceId: null,
      color: '#ccc',
      sortOrder: 3,
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
  };

  const tasks: TaskRecord[] = [
    {
      taskId: 'task-shared',
      listId: 'list-shared',
      title: '共享任务',
      dueDateKey: '2026-03-18',
      isCompleted: false,
      assigneeUserIds: ['u1', 'u2'],
      createdBy: 'u1',
      updatedBy: 'u1',
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
    {
      taskId: 'task-mine',
      listId: 'list-mine',
      title: '我的任务',
      dueDateKey: '2026-03-20',
      isCompleted: false,
      assigneeUserIds: ['u1'],
      createdBy: 'u1',
      updatedBy: 'u1',
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
    {
      taskId: 'task-partner',
      listId: 'list-partner',
      title: '对方任务',
      dueDateKey: '2026-03-22',
      isCompleted: false,
      assigneeUserIds: ['u2'],
      createdBy: 'u2',
      updatedBy: 'u2',
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
    {
      taskId: 'task-other-month',
      listId: 'list-shared',
      title: '四月任务',
      dueDateKey: '2026-04-01',
      isCompleted: false,
      assigneeUserIds: ['u1'],
      createdBy: 'u1',
      updatedBy: 'u1',
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
  ];

  it('queries month tasks by dueDateKey prefix', () => {
    expect(filterMonthTasks(tasks, '2026-03').map((task) => task.taskId)).toEqual([
      'task-shared',
      'task-mine',
      'task-partner',
    ]);
  });

  it('filters home data for all shared and mine scopes', () => {
    expect(
      filterTasksForHomeScope({
        tasks,
        lists,
        scope: 'all',
        viewerUserId: 'u1',
        viewerSpaceId: 'space-1',
      }).map((task) => task.taskId),
    ).toEqual(['task-shared', 'task-mine', 'task-other-month']);

    expect(
      filterTasksForHomeScope({
        tasks,
        lists,
        scope: 'shared',
        viewerUserId: 'u1',
        viewerSpaceId: 'space-1',
      }).map((task) => task.taskId),
    ).toEqual(['task-shared', 'task-other-month']);

    expect(
      filterTasksForHomeScope({
        tasks,
        lists,
        scope: 'mine',
        viewerUserId: 'u1',
        viewerSpaceId: 'space-1',
      }).map((task) => task.taskId),
    ).toEqual(['task-mine']);
  });

  it('maps cloud docs to typed task models', () => {
    expect(
      normalizeTaskRecord({
        taskId: 'task-1',
        listId: 'list-mine',
        title: '任务',
        dueDateKey: '2026-03-18',
        isCompleted: 0,
        assigneeUserIds: ['u1'],
        createdBy: 'u1',
        updatedBy: 'u1',
        createdAt: '2026-03-18T10:00:00.000Z',
        updatedAt: '2026-03-18T10:00:00.000Z',
      }),
    ).toEqual({
      taskId: 'task-1',
      listId: 'list-mine',
      title: '任务',
      dueDateKey: '2026-03-18',
      isCompleted: false,
      assigneeUserIds: ['u1'],
      createdBy: 'u1',
      updatedBy: 'u1',
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    });
  });
});
