import { canUseListForTask, canViewList, normalizeAssigneeUserIds } from '@/utils/permissions';

describe('permissions', () => {
  it('allows shared list usage for members of the same space', () => {
    expect(
      canUseListForTask({
        viewerUserId: 'u1',
        listType: 'shared',
        listOwnerUserId: 'u1',
        taskSpaceId: 's1',
        viewerSpaceId: 's1',
      }),
    ).toBe(true);
  });

  it('blocks writing into the other users private list', () => {
    expect(
      canUseListForTask({
        viewerUserId: 'u1',
        listType: 'private',
        listOwnerUserId: 'u2',
        taskSpaceId: null,
        viewerSpaceId: 's1',
      }),
    ).toBe(false);
  });

  it('lets viewers see shared lists and their own private lists only', () => {
    expect(
      canViewList({
        viewerUserId: 'u1',
        listType: 'shared',
        listOwnerUserId: 'u2',
        listSpaceId: 's1',
        viewerSpaceId: 's1',
      }),
    ).toBe(true);
    expect(
      canViewList({
        viewerUserId: 'u1',
        listType: 'private',
        listOwnerUserId: 'u1',
        listSpaceId: null,
        viewerSpaceId: 's1',
      }),
    ).toBe(true);
    expect(
      canViewList({
        viewerUserId: 'u1',
        listType: 'private',
        listOwnerUserId: 'u2',
        listSpaceId: null,
        viewerSpaceId: 's1',
      }),
    ).toBe(false);
  });

  it('normalizes assignee ids to the allowed unique set', () => {
    expect(normalizeAssigneeUserIds(['u2', 'u2', 'u1'], 'u1', 'u2')).toEqual(['u1', 'u2']);
    expect(normalizeAssigneeUserIds([], 'u1')).toEqual(['u1']);
  });
});
