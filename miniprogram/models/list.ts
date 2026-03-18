export type ListType = 'shared' | 'private';

export interface ListRecord {
  listId: string;
  name: string;
  type: ListType;
  ownerUserId: string;
  spaceId: string | null;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
