const { initCloudDb, cloud } = require('../_shared/db');
const { assertUserNotInSpace } = require('../_shared/guards');

exports.main = async (event = {}) => {
  const db = initCloudDb();
  const now = new Date();
  const context = cloud.getWXContext();
  const userId = event.userId || context.OPENID;

  assertUserNotInSpace(userId, event.currentSpaceId || null);

  const timestamp = now.getTime();
  const createdAt = now.toISOString();
  const expiresAt = new Date(timestamp + 24 * 60 * 60 * 1000).toISOString();

  const spacePayload = {
    status: 'pending',
    ownerUserId: userId,
    partnerUserId: null,
    createdAt,
    updatedAt: createdAt,
  };

  const spaceResult = await db.collection('spaces').add({
    data: spacePayload,
  });

  const invitePayload = {
    spaceId: spaceResult._id,
    inviterUserId: userId,
    status: 'pending',
    expiresAt,
    createdAt,
    updatedAt: createdAt,
  };

  const inviteResult = await db.collection('spaceInvites').add({
    data: invitePayload,
  });

  return {
    space: {
      ...spacePayload,
      spaceId: spaceResult._id,
    },
    invite: {
      ...invitePayload,
      inviteId: inviteResult._id,
    },
  };
};
