import {
  InviteFlowError,
  acceptInviteBundle,
  buildPendingInviteBundle,
} from '@/services/space-service';

describe('invite flow domain', () => {
  it('creates a pending space and invite for a solo user', () => {
    const now = new Date('2026-03-18T10:00:00.000Z');

    const result = buildPendingInviteBundle({
      ownerUserId: 'u1',
      now,
      inviteId: 'invite-1',
      spaceId: 'space-1',
    });

    expect(result.space.status).toBe('pending');
    expect(result.space.ownerUserId).toBe('u1');
    expect(result.space.partnerUserId).toBeNull();
    expect(result.invite.status).toBe('pending');
    expect(result.invite.spaceId).toBe('space-1');
  });

  it('rejects invite acceptance if the invite is expired', () => {
    expect(() =>
      acceptInviteBundle({
        joinerUserId: 'u2',
        joinerCurrentSpaceId: null,
        now: new Date('2026-03-20T10:00:00.000Z'),
        space: {
          spaceId: 'space-1',
          status: 'pending',
          ownerUserId: 'u1',
          partnerUserId: null,
          createdAt: '2026-03-18T10:00:00.000Z',
          updatedAt: '2026-03-18T10:00:00.000Z',
        },
        invite: {
          inviteId: 'invite-1',
          spaceId: 'space-1',
          inviterUserId: 'u1',
          status: 'pending',
          expiresAt: '2026-03-19T10:00:00.000Z',
          createdAt: '2026-03-18T10:00:00.000Z',
          updatedAt: '2026-03-18T10:00:00.000Z',
        },
      }),
    ).toThrow(new InviteFlowError('Invite is expired', 'INVITE_EXPIRED'));
  });

  it('rejects invite acceptance if the second user is already in a space', () => {
    const bundle = buildPendingInviteBundle({
      ownerUserId: 'u1',
      now: new Date('2026-03-18T10:00:00.000Z'),
      inviteId: 'invite-1',
      spaceId: 'space-1',
    });

    expect(() =>
      acceptInviteBundle({
        ...bundle,
        joinerUserId: 'u2',
        joinerCurrentSpaceId: 'space-other',
        now: new Date('2026-03-18T10:10:00.000Z'),
      }),
    ).toThrow(new InviteFlowError('User already belongs to a space', 'USER_ALREADY_IN_SPACE'));
  });

  it('marks the space active once the second user joins', () => {
    const bundle = buildPendingInviteBundle({
      ownerUserId: 'u1',
      now: new Date('2026-03-18T10:00:00.000Z'),
      inviteId: 'invite-1',
      spaceId: 'space-1',
    });

    const result = acceptInviteBundle({
      ...bundle,
      joinerUserId: 'u2',
      joinerCurrentSpaceId: null,
      now: new Date('2026-03-18T10:10:00.000Z'),
    });

    expect(result.space.status).toBe('active');
    expect(result.space.partnerUserId).toBe('u2');
    expect(result.invite.status).toBe('accepted');
  });
});
