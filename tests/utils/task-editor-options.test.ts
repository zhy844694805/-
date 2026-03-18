import { ListRecord } from '@/models/list';
import {
  buildAssigneeOptions,
  buildListOptions,
  resolveInitialDueDateKey,
} from '@/utils/task-editor-options';
import { LocalDate } from '@/utils/date/local-date';

describe('task-editor options', () => {
  const lists: ListRecord[] = [
    {
      listId: 'shared',
      name: '共享清单',
      type: 'shared',
      ownerUserId: 'u1',
      spaceId: 'space-1',
      color: '#ddd',
      sortOrder: 1,
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
    {
      listId: 'mine',
      name: '我的清单',
      type: 'private',
      ownerUserId: 'u1',
      spaceId: null,
      color: '#ccc',
      sortOrder: 2,
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
    {
      listId: 'partner',
      name: '对方清单',
      type: 'private',
      ownerUserId: 'u2',
      spaceId: null,
      color: '#bbb',
      sortOrder: 3,
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
  ];

  it('inherits the currently selected date for new tasks', () => {
    expect(resolveInitialDueDateKey('2026-03-21', new LocalDate(2026, 3, 18))).toBe('2026-03-21');
  });

  it('solo users only get self-assignment', () => {
    expect(buildAssigneeOptions({ viewerUserId: 'u1', partnerUserId: null })).toEqual([
      { label: '我', value: 'u1' },
    ]);
  });

  it('paired users can choose shared lists or their own private lists', () => {
    expect(
      buildListOptions({
        lists,
        viewerUserId: 'u1',
        hasActiveSpace: true,
      }),
    ).toEqual([
      { label: '共享清单', value: 'shared' },
      { label: '我的清单', value: 'mine' },
    ]);

    expect(buildAssigneeOptions({ viewerUserId: 'u1', partnerUserId: 'u2' })).toEqual([
      { label: '我', value: 'u1' },
      { label: '对方', value: 'u2' },
      { label: '双方', value: 'u1,u2' },
    ]);
  });
});
