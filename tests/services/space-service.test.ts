import { canCreateInvite } from '@/services/space-service';

describe('space-service', () => {
  it('allows invite creation when the user has no active partner', () => {
    expect(canCreateInvite({ currentSpaceId: null })).toBe(true);
  });

  it('blocks invite creation when already in an active space', () => {
    expect(canCreateInvite({ currentSpaceId: 'space-1' })).toBe(false);
  });
});
