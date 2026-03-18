import { normalizeUserRecord } from '@/services/user-service';

describe('user-service', () => {
  it('maps a cloud user record to app session data', () => {
    expect(
      normalizeUserRecord({
        userId: 'u1',
        nickname: 'A',
        currentSpaceId: null,
      }),
    ).toEqual({
      userId: 'u1',
      nickname: 'A',
      avatarUrl: '',
      currentSpaceId: null,
    });
  });
});
