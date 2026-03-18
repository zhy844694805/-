function createError(message, code) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function assertUserNotInSpace(userId, currentSpaceId) {
  if (currentSpaceId) {
    throw createError(`User ${userId} already belongs to a space`, 'USER_ALREADY_IN_SPACE');
  }
}

function assertInviteUsable(inviteRecord, now = new Date()) {
  if (!inviteRecord || inviteRecord.status !== 'pending') {
    throw createError('Invite is not pending', 'INVITE_INVALID');
  }

  if (new Date(inviteRecord.expiresAt).getTime() <= now.getTime()) {
    throw createError('Invite is expired', 'INVITE_EXPIRED');
  }
}

function assertSpaceJoinable(spaceRecord) {
  if (!spaceRecord || spaceRecord.status !== 'pending' || spaceRecord.partnerUserId) {
    throw createError('Space is not joinable', 'SPACE_NOT_JOINABLE');
  }
}

module.exports = {
  assertInviteUsable,
  assertSpaceJoinable,
  assertUserNotInSpace,
};
