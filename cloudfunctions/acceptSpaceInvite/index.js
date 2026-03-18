const { initCloudDb, cloud } = require('../_shared/db');
const {
  assertInviteUsable,
  assertSpaceJoinable,
  assertUserNotInSpace,
} = require('../_shared/guards');

exports.main = async (event = {}) => {
  const db = initCloudDb();
  const now = new Date();
  const context = cloud.getWXContext();
  const userId = event.userId || context.OPENID;

  assertUserNotInSpace(userId, event.currentSpaceId || null);

  const inviteSnapshot = await db.collection('spaceInvites').doc(event.inviteId).get();
  const inviteRecord = inviteSnapshot.data;

  assertInviteUsable(inviteRecord, now);

  const spaceSnapshot = await db.collection('spaces').doc(inviteRecord.spaceId).get();
  const spaceRecord = spaceSnapshot.data;

  assertSpaceJoinable(spaceRecord);

  const updatedAt = now.toISOString();

  await db.collection('spaces').doc(inviteRecord.spaceId).update({
    data: {
      status: 'active',
      partnerUserId: userId,
      updatedAt,
    },
  });

  await db.collection('spaceInvites').doc(event.inviteId).update({
    data: {
      status: 'accepted',
      acceptedByUserId: userId,
      updatedAt,
    },
  });

  return {
    space: {
      ...spaceRecord,
      spaceId: inviteRecord.spaceId,
      status: 'active',
      partnerUserId: userId,
      updatedAt,
    },
    invite: {
      ...inviteRecord,
      inviteId: event.inviteId,
      status: 'accepted',
      acceptedByUserId: userId,
      updatedAt,
    },
  };
};
