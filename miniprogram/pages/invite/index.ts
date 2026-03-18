import {
  InvitePageState,
  createInviteLoadingState,
  resolveInviteAcceptanceState,
} from '@/services/invite-entry-service';
import { acceptSpaceInvite } from '@/services/space-service';

Page({
  data: {
    inviteState: {
      inviteId: '',
      phase: 'loading',
      message: '正在接受邀请...',
      redirectUrl: '',
    } as InvitePageState & { redirectUrl: string },
  },

  async onLoad(options: Record<string, string | undefined>) {
    const inviteId = options.inviteId;

    if (!inviteId) {
      this.setData({
        inviteState: {
          inviteId: '',
          phase: 'error',
          message: '邀请参数缺失，请让对方重新发送',
          redirectUrl: '',
        },
      });
      return;
    }

    this.setData({
      inviteState: {
        ...createInviteLoadingState(inviteId),
        redirectUrl: '',
      },
    });

    const inviteState = await resolveInviteAcceptanceState({
      inviteId,
      acceptInvite: async (currentInviteId) => {
        await acceptSpaceInvite(currentInviteId);
      },
    });

    this.setData({
      inviteState: {
        ...inviteState,
        redirectUrl: inviteState.redirectUrl ?? '',
      },
    });

    if (inviteState.phase === 'success' && inviteState.redirectUrl) {
      setTimeout(() => {
        wx.redirectTo({
          url: inviteState.redirectUrl || '/pages/home/index',
        });
      }, 900);
    }
  },
});
