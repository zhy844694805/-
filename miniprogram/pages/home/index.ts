import { buildInviteSharePath } from '@/services/invite-entry-service';
import { canCreateInvite, createSpaceInvite } from '@/services/space-service';
import { AppStore } from '@/stores/app-store';
import { HomeStore } from '@/stores/home-store';
import { LocalDate } from '@/utils/date/local-date';

const appStore = new AppStore();
let homeStore: HomeStore | null = null;

interface HomePageCell {
  dueDateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  previewItems: string[];
  overflowCount: number;
}

interface HomePageTask {
  taskId: string;
  title: string;
  subtitle: string;
  isCompleted: boolean;
}

function getToday(): LocalDate {
  const now = new Date();
  return new LocalDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function formatSelectedDateLabel(date: LocalDate): string {
  return `${date.month} 月 ${date.day} 日`;
}

function buildAssigneeLabel(assigneeUserIds: string[]): string {
  if (assigneeUserIds.length >= 2) {
    return '指派给双方';
  }

  return assigneeUserIds[0] === 'partner' ? '指派给对方' : '指派给我';
}

Page({
  data: {
    bootstrapState: 'loading',
    bootstrapError: '',
    userNickname: '',
    hasSession: false,
    monthTitle: '',
    visibleScope: 'all',
    monthCells: [] as HomePageCell[],
    selectedDateLabel: '',
    selectedDayTasks: [] as HomePageTask[],
    canInvitePartner: false,
    pendingInviteId: '',
  },

  onLoad() {
    void this.bootstrap();
  },

  async bootstrap() {
    await appStore.bootstrap();

     if (appStore.state !== 'ready') {
      this.setData({
        bootstrapState: appStore.state,
        bootstrapError: appStore.errorMessage,
        userNickname: appStore.user?.nickname ?? '',
        hasSession: Boolean(appStore.user),
      });
      return;
    }

    homeStore = new HomeStore({
      today: getToday(),
      viewerUserId: appStore.user?.userId ?? 'solo-user',
      viewerSpaceId: appStore.user?.currentSpaceId ?? null,
      tasks: [],
      lists: {},
    });

    this.setData({
      bootstrapState: appStore.state,
      bootstrapError: appStore.errorMessage,
      userNickname: appStore.user?.nickname ?? '',
      hasSession: Boolean(appStore.user),
      canInvitePartner: canCreateInvite({
        currentSpaceId: appStore.user?.currentSpaceId ?? null,
      }),
    });

    this.renderHome();
  },

  async onInvitePartnerTap() {
    if (!this.data.canInvitePartner) {
      return;
    }

    try {
      const result = await createSpaceInvite();

      this.setData({
        pendingInviteId: result.invite.inviteId,
      });

      wx.showToast({
        title: '请从右上角分享给对方',
        icon: 'none',
      });
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '创建邀请失败',
        icon: 'none',
      });
    }
  },

  renderHome() {
    if (!homeStore) {
      return;
    }

    this.setData({
      monthTitle: homeStore.monthTitle,
      visibleScope: homeStore.visibleScope,
      selectedDateLabel: formatSelectedDateLabel(homeStore.selectedDate),
      monthCells: homeStore.monthCells.map((cell) => ({
        dueDateKey: cell.dueDateKey,
        day: cell.date.day,
        isCurrentMonth: cell.isCurrentMonth,
        isSelected: cell.dueDateKey === homeStore?.selectedDueDateKey,
        previewItems: cell.tasks.slice(0, 2).map((task) => task.title),
        overflowCount: Math.max(cell.tasks.length - 2, 0),
      })),
      selectedDayTasks: homeStore.selectedDayTasks.map((task) => ({
        taskId: task.taskId,
        title: task.title,
        subtitle: buildAssigneeLabel(task.assigneeUserIds),
        isCompleted: task.isCompleted,
      })),
    });
  },

  onPrevMonth() {
    if (!homeStore) {
      return;
    }

    homeStore.shiftMonth(-1);
    this.renderHome();
  },

  onNextMonth() {
    if (!homeStore) {
      return;
    }

    homeStore.shiftMonth(1);
    this.renderHome();
  },

  onGoToday() {
    if (!homeStore) {
      return;
    }

    homeStore.goToToday();
    this.renderHome();
  },

  onScopeChange(event: WechatMiniprogram.CustomEvent<{ scope: 'all' | 'shared' | 'mine' }>) {
    if (!homeStore) {
      return;
    }

    homeStore.setVisibleScope(event.detail.scope);
    this.renderHome();
  },

  onDaySelect(event: WechatMiniprogram.CustomEvent<{ dueDateKey: string }>) {
    if (!homeStore) {
      return;
    }

    homeStore.selectDateByKey(event.detail.dueDateKey);
    this.renderHome();
  },

  onAddTask() {
    if (!homeStore) {
      return;
    }

    wx.navigateTo({
      url: `/pages/task-editor/index?dueDateKey=${homeStore.selectedDueDateKey}`,
    });
  },

  onTaskToggle() {},

  onTaskOpen(event: WechatMiniprogram.CustomEvent<{ taskId: string }>) {
    wx.navigateTo({
      url: `/pages/task-editor/index?taskId=${event.detail.taskId}`,
    });
  },

  onShareAppMessage() {
    const path = this.data.pendingInviteId
      ? buildInviteSharePath(this.data.pendingInviteId)
      : '/pages/home/index';

    return {
      title: '一起用任务清单安排生活',
      path,
    };
  },
});
