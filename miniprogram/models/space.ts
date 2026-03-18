export type SpaceStatus = 'pending' | 'active';
export type SpaceInviteStatus = 'pending' | 'accepted' | 'expired';

export interface SpaceRecord {
  spaceId: string;
  status: SpaceStatus;
  ownerUserId: string;
  partnerUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SpaceInviteRecord {
  inviteId: string;
  spaceId: string;
  inviterUserId: string;
  status: SpaceInviteStatus;
  expiresAt: string;
  acceptedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}
