import { ListRecord } from '@/models/list';
import { loadCurrentUser } from '@/services/user-service';

function createListRecord(input: {
  listId: string;
  name: string;
  type: 'shared' | 'private';
  ownerUserId: string;
  spaceId: string | null;
}): ListRecord {
  const timestamp = new Date().toISOString();

  return {
    ...input,
    color: input.type === 'shared' ? '#f0dcc1' : '#d8d0c7',
    sortOrder: Date.now(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

Page({
  data: {
    lists: [] as ListRecord[],
    privateListName: '',
    sharedListName: '',
    renameValue: '',
    renameTargetId: '',
    hasActiveSpace: false,
    viewerUserId: 'solo-user',
    currentSpaceId: null as string | null,
  },

  async onLoad() {
    const currentUser = await loadCurrentUser();
    const viewerUserId = currentUser?.userId ?? 'solo-user';
    const currentSpaceId = currentUser?.currentSpaceId ?? null;
    const initialLists = [
      createListRecord({
        listId: 'private-default',
        name: '我的清单',
        type: 'private',
        ownerUserId: viewerUserId,
        spaceId: null,
      }),
    ];

    if (currentSpaceId) {
      initialLists.unshift(
        createListRecord({
          listId: 'shared-default',
          name: '共享清单',
          type: 'shared',
          ownerUserId: viewerUserId,
          spaceId: currentSpaceId,
        }),
      );
    }

    this.setData({
      lists: initialLists,
      hasActiveSpace: Boolean(currentSpaceId),
      viewerUserId,
      currentSpaceId,
    });
  },

  onPrivateNameInput(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({
      privateListName: event.detail.value,
    });
  },

  onSharedNameInput(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({
      sharedListName: event.detail.value,
    });
  },

  onRenameInput(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({
      renameValue: event.detail.value,
    });
  },

  onSelectRenameTarget(event: WechatMiniprogram.BaseEvent) {
    this.setData({
      renameTargetId: event.currentTarget.dataset.listId,
      renameValue: event.currentTarget.dataset.listName,
    });
  },

  onCreatePrivateList() {
    if (!this.data.privateListName.trim()) {
      return;
    }

    this.setData({
      lists: this.data.lists.concat(
        createListRecord({
          listId: `private-${Date.now()}`,
          name: this.data.privateListName.trim(),
          type: 'private',
          ownerUserId: this.data.viewerUserId,
          spaceId: null,
        }),
      ),
      privateListName: '',
    });
  },

  onCreateSharedList() {
    if (!this.data.sharedListName.trim() || !this.data.hasActiveSpace) {
      return;
    }

    this.setData({
      lists: this.data.lists.concat(
        createListRecord({
          listId: `shared-${Date.now()}`,
          name: this.data.sharedListName.trim(),
          type: 'shared',
          ownerUserId: this.data.viewerUserId,
          spaceId: this.data.currentSpaceId,
        }),
      ),
      sharedListName: '',
    });
  },

  onRenameList() {
    if (!this.data.renameTargetId || !this.data.renameValue.trim()) {
      return;
    }

    this.setData({
      lists: this.data.lists.map((list) =>
        list.listId === this.data.renameTargetId
          ? {
              ...list,
              name: this.data.renameValue.trim(),
            }
          : list,
      ),
      renameTargetId: '',
      renameValue: '',
    });
  },
});
