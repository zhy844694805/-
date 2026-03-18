import { SpaceInviteRecord, SpaceRecord } from '@/models/space';

const DEFAULT_INVITE_TTL_MS = 24 * 60 * 60 * 1000;

export class InviteFlowError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'USER_ALREADY_IN_SPACE'
      | 'INVITE_EXPIRED'
      | 'SPACE_NOT_JOINABLE',
  ) {
    super(message);
    this.name = 'InviteFlowError';
  }
}

export function canCreateInvite(user: { currentSpaceId?: string | null }): boolean {
  return !user.currentSpaceId;
}

export function buildPendingInviteBundle(input: {
  ownerUserId: string;
  now: Date;
  inviteId?: string;
  spaceId?: string;
  inviteTtlMs?: number;
}): { space: SpaceRecord; invite: SpaceInviteRecord } {
  const createdAt = input.now.toISOString();
  const spaceId = input.spaceId ?? `space-${input.now.getTime()}`;
  const inviteId = input.inviteId ?? `invite-${input.now.getTime()}`;
  const inviteTtlMs = input.inviteTtlMs ?? DEFAULT_INVITE_TTL_MS;

  return {
    space: {
      spaceId,
      status: 'pending',
      ownerUserId: input.ownerUserId,
      partnerUserId: null,
      createdAt,
      updatedAt: createdAt,
    },
    invite: {
      inviteId,
      spaceId,
      inviterUserId: input.ownerUserId,
      status: 'pending',
      expiresAt: new Date(input.now.getTime() + inviteTtlMs).toISOString(),
      createdAt,
      updatedAt: createdAt,
    },
  };
}

export function acceptInviteBundle(input: {
  invite: SpaceInviteRecord;
  space: SpaceRecord;
  joinerUserId: string;
  joinerCurrentSpaceId: string | null;
  now: Date;
}): { space: SpaceRecord; invite: SpaceInviteRecord } {
  if (input.joinerCurrentSpaceId) {
    throw new InviteFlowError('User already belongs to a space', 'USER_ALREADY_IN_SPACE');
  }

  if (
    input.invite.status !== 'pending' ||
    new Date(input.invite.expiresAt).getTime() <= input.now.getTime()
  ) {
    throw new InviteFlowError('Invite is expired', 'INVITE_EXPIRED');
  }

  if (input.space.status !== 'pending' || input.space.partnerUserId) {
    throw new InviteFlowError('Space is not joinable', 'SPACE_NOT_JOINABLE');
  }

  const updatedAt = input.now.toISOString();

  return {
    space: {
      ...input.space,
      status: 'active',
      partnerUserId: input.joinerUserId,
      updatedAt,
    },
    invite: {
      ...input.invite,
      status: 'accepted',
      acceptedByUserId: input.joinerUserId,
      updatedAt,
    },
  };
}

export async function createSpaceInvite(): Promise<{
  space: SpaceRecord;
  invite: SpaceInviteRecord;
}> {
  const response = await wx.cloud.callFunction({
    name: 'createSpaceInvite',
  });

  return response.result as { space: SpaceRecord; invite: SpaceInviteRecord };
}

export async function acceptSpaceInvite(inviteId: string): Promise<{
  space: SpaceRecord;
  invite: SpaceInviteRecord;
}> {
  const response = await wx.cloud.callFunction({
    name: 'acceptSpaceInvite',
    data: { inviteId },
  });

  return response.result as { space: SpaceRecord; invite: SpaceInviteRecord };
}
