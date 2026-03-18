import { ListRecord } from '@/models/list';
import { LocalDate } from '@/utils/date/local-date';
import { toDueDateKey } from '@/utils/date/due-date-key';

export interface EditorOption {
  label: string;
  value: string;
}

export function resolveInitialDueDateKey(
  selectedDueDateKey: string | undefined,
  today: LocalDate,
): string {
  return selectedDueDateKey ?? toDueDateKey(today);
}

export function buildAssigneeOptions(input: {
  viewerUserId: string;
  partnerUserId: string | null;
}): EditorOption[] {
  if (!input.partnerUserId) {
    return [{ label: '我', value: input.viewerUserId }];
  }

  return [
    { label: '我', value: input.viewerUserId },
    { label: '对方', value: input.partnerUserId },
    { label: '双方', value: `${input.viewerUserId},${input.partnerUserId}` },
  ];
}

export function buildListOptions(input: {
  lists: ListRecord[];
  viewerUserId: string;
  hasActiveSpace: boolean;
}): EditorOption[] {
  return input.lists
    .filter((list) => {
      if (list.type === 'shared') {
        return input.hasActiveSpace;
      }

      return list.ownerUserId === input.viewerUserId;
    })
    .map((list) => ({
      label: list.name,
      value: list.listId,
    }));
}
