import { ListRecord, ListType } from '@/models/list';

export function normalizeListRecord(record: Partial<ListRecord> & Pick<ListRecord, 'listId' | 'name'>): ListRecord {
  return {
    listId: record.listId,
    name: record.name,
    type: record.type ?? 'private',
    ownerUserId: record.ownerUserId ?? '',
    spaceId: record.spaceId ?? null,
    color: record.color ?? '#d8d0c7',
    sortOrder: record.sortOrder ?? 0,
    createdAt: record.createdAt ?? '',
    updatedAt: record.updatedAt ?? '',
  };
}

export function indexListsById(lists: ListRecord[]): Record<string, ListRecord> {
  return lists.reduce<Record<string, ListRecord>>((accumulator, list) => {
    accumulator[list.listId] = list;
    return accumulator;
  }, {});
}

export async function createList(input: {
  name: string;
  type: ListType;
  ownerUserId: string;
  spaceId?: string | null;
}): Promise<ListRecord> {
  const response = await wx.cloud.callFunction({
    name: 'manageList',
    data: {
      action: 'create',
      ...input,
    },
  });

  return response.result as ListRecord;
}

export async function renameList(listId: string, name: string): Promise<ListRecord> {
  const response = await wx.cloud.callFunction({
    name: 'manageList',
    data: {
      action: 'rename',
      listId,
      name,
    },
  });

  return response.result as ListRecord;
}
