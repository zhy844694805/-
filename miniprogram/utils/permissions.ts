import { ListType } from '@/models/list';

export function canViewList(input: {
  viewerUserId: string;
  listType: ListType;
  listOwnerUserId: string;
  listSpaceId: string | null;
  viewerSpaceId: string | null;
}): boolean {
  if (input.listType === 'shared') {
    return Boolean(input.listSpaceId && input.listSpaceId === input.viewerSpaceId);
  }

  return input.viewerUserId === input.listOwnerUserId;
}

export function canUseListForTask(input: {
  viewerUserId: string;
  listType: ListType;
  listOwnerUserId: string;
  taskSpaceId: string | null;
  viewerSpaceId: string | null;
}): boolean {
  if (input.listType === 'shared') {
    return Boolean(input.taskSpaceId && input.taskSpaceId === input.viewerSpaceId);
  }

  return input.viewerUserId === input.listOwnerUserId;
}

export function normalizeAssigneeUserIds(
  assigneeUserIds: string[],
  viewerUserId: string,
  partnerUserId?: string | null,
): string[] {
  const allowedUserIds = [viewerUserId];

  if (partnerUserId) {
    allowedUserIds.push(partnerUserId);
  }

  const normalized = Array.from(new Set(assigneeUserIds)).filter((userId) =>
    allowedUserIds.includes(userId),
  );

  return normalized.length > 0 ? normalized.sort() : [viewerUserId];
}
