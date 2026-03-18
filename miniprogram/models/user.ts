export interface CloudUserRecord {
  userId: string;
  nickname?: string;
  avatarUrl?: string;
  currentSpaceId?: string | null;
}

export interface AppUserSession {
  userId: string;
  nickname: string;
  avatarUrl: string;
  currentSpaceId: string | null;
}
