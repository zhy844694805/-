import { AppUserSession, CloudUserRecord } from '@/models/user';

const CURRENT_USER_STORAGE_KEY = 'current-user';

export function normalizeUserRecord(record: CloudUserRecord): AppUserSession {
  return {
    userId: record.userId,
    nickname: record.nickname ?? '微信用户',
    avatarUrl: record.avatarUrl ?? '',
    currentSpaceId: record.currentSpaceId ?? null,
  };
}

export async function loadCurrentUser(): Promise<AppUserSession | null> {
  const cachedUser = wx.getStorageSync<CloudUserRecord | undefined>(CURRENT_USER_STORAGE_KEY);

  if (!cachedUser) {
    return null;
  }

  return normalizeUserRecord(cachedUser);
}
