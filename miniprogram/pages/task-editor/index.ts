import { ListRecord } from '@/models/list';
import { loadCurrentUser } from '@/services/user-service';
import {
  buildAssigneeOptions,
  buildListOptions,
  resolveInitialDueDateKey,
} from '@/utils/task-editor-options';
import { LocalDate } from '@/utils/date/local-date';

function getToday(): LocalDate {
  const now = new Date();
  return new LocalDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function buildEditorLists(viewerUserId: string, currentSpaceId: string | null): ListRecord[] {
  const baseTimestamp = new Date().toISOString();
  const lists: ListRecord[] = [
    {
      listId: 'private-default',
      name: '我的清单',
      type: 'private',
      ownerUserId: viewerUserId,
      spaceId: null,
      color: '#d8d0c7',
      sortOrder: 1,
      createdAt: baseTimestamp,
      updatedAt: baseTimestamp,
    },
  ];

  if (currentSpaceId) {
    lists.unshift({
      listId: 'shared-default',
      name: '共享清单',
      type: 'shared',
      ownerUserId: viewerUserId,
      spaceId: currentSpaceId,
      color: '#f0dcc1',
      sortOrder: 0,
      createdAt: baseTimestamp,
      updatedAt: baseTimestamp,
    });
  }

  return lists;
}

Page({
  data: {
    title: '',
    dueDateKey: '',
    listOptions: [] as Array<{ label: string; value: string }>,
    listLabels: [] as string[],
    selectedListIndex: 0,
    assigneeOptions: [] as Array<{ label: string; value: string }>,
    assigneeLabels: [] as string[],
    selectedAssigneeIndex: 0,
    pageMode: 'create',
  },

  async onLoad(options: Record<string, string | undefined>) {
    const currentUser = await loadCurrentUser();
    const viewerUserId = currentUser?.userId ?? 'solo-user';
    const currentSpaceId = currentUser?.currentSpaceId ?? null;
    const partnerUserId = currentSpaceId ? 'partner-user' : null;
    const lists = buildEditorLists(viewerUserId, currentSpaceId);
    const listOptions = buildListOptions({
      lists,
      viewerUserId,
      hasActiveSpace: Boolean(currentSpaceId),
    });
    const assigneeOptions = buildAssigneeOptions({
      viewerUserId,
      partnerUserId,
    });

    this.setData({
      dueDateKey: resolveInitialDueDateKey(options.dueDateKey, getToday()),
      listOptions,
      listLabels: listOptions.map((option) => option.label),
      assigneeOptions,
      assigneeLabels: assigneeOptions.map((option) => option.label),
      pageMode: options.taskId ? 'edit' : 'create',
    });
  },

  onTitleInput(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({
      title: event.detail.value,
    });
  },

  onDateChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({
      dueDateKey: event.detail.value,
    });
  },

  onListChange(event: WechatMiniprogram.CustomEvent<{ value: number }>) {
    this.setData({
      selectedListIndex: Number(event.detail.value),
    });
  },

  onAssigneeChange(event: WechatMiniprogram.CustomEvent<{ value: number }>) {
    this.setData({
      selectedAssigneeIndex: Number(event.detail.value),
    });
  },

  onSave() {
    wx.showToast({
      title: '已保存草稿',
      icon: 'success',
    });
  },
});
