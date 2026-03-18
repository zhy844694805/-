export interface InvitePageState {
  inviteId: string;
  phase: 'loading' | 'success' | 'error';
  message: string;
  redirectUrl?: string;
}

export function buildInviteSharePath(inviteId: string): string {
  return `/pages/invite/index?inviteId=${inviteId}`;
}

export function createInviteLoadingState(inviteId: string): InvitePageState {
  return {
    inviteId,
    phase: 'loading',
    message: '正在接受邀请...',
  };
}

export async function resolveInviteAcceptanceState(input: {
  inviteId: string;
  acceptInvite: (inviteId: string) => Promise<void>;
}): Promise<InvitePageState> {
  try {
    await input.acceptInvite(input.inviteId);

    return {
      inviteId: input.inviteId,
      phase: 'success',
      message: '绑定成功，正在返回首页',
      redirectUrl: '/pages/home/index',
    };
  } catch (error) {
    return {
      inviteId: input.inviteId,
      phase: 'error',
      message: error instanceof Error ? error.message : '邀请处理失败，请稍后重试',
    };
  }
}
