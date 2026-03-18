import { ListRecord } from '@/models/list';
import { TaskRecord } from '@/models/task';
import { HomeStore } from '@/stores/home-store';
import { LocalDate } from '@/utils/date/local-date';

describe('HomeStore', () => {
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
    mine: {
      listId: 'mine',
      name: '我的',
      type: 'private',
      ownerUserId: 'u1',
      spaceId: null,
      color: '#ccc',
      sortOrder: 2,
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
    partner: {
      listId: 'partner',
      name: '对方',
      type: 'private',
      ownerUserId: 'u2',
      spaceId: null,
      color: '#bbb',
      sortOrder: 3,
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
    {
      taskId: 'task-2',
      listId: 'mine',
      title: '我的任务',
      dueDateKey: '2026-03-18',
      isCompleted: false,
      assigneeUserIds: ['u1'],
      createdBy: 'u1',
      updatedBy: 'u1',
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
    {
      taskId: 'task-3',
      listId: 'partner',
      title: '对方任务',
      dueDateKey: '2026-03-18',
      isCompleted: false,
      assigneeUserIds: ['u2'],
      createdBy: 'u2',
      updatedBy: 'u2',
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
    {
      taskId: 'task-4',
      listId: 'shared',
      title: '另一天共享任务',
      dueDateKey: '2026-03-20',
      isCompleted: false,
      assigneeUserIds: ['u1'],
      createdBy: 'u1',
      updatedBy: 'u1',
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
  ];

  function createStore() {
    return new HomeStore({
      today: new LocalDate(2026, 3, 18),
      viewerUserId: 'u1',
      viewerSpaceId: 'space-1',
      tasks,
      lists,
    });
  }

  it('defaults the selected date to today', () => {
    const store = createStore();

    expect(store.selectedDate).toEqual(new LocalDate(2026, 3, 18));
  });

  it('groups month summaries by dueDateKey', () => {
    const store = createStore();
    const targetCell = store.monthCells.find((cell) => cell.dueDateKey === '2026-03-18');

    expect(targetCell?.tasks.map((task) => task.taskId)).toEqual(['task-1', 'task-2']);
  });

  it('keeps partner private tasks out of the all scope', () => {
    const store = createStore();

    expect(store.visibleTasks.map((task) => task.taskId)).toEqual(['task-1', 'task-2', 'task-4']);
  });

  it('updates the selected-day tasks when choosing another day', () => {
    const store = createStore();

    store.selectDate(new LocalDate(2026, 3, 20));

    expect(store.selectedDayTasks.map((task) => task.taskId)).toEqual(['task-4']);
  });
});
