const { initCloudDb, cloud } = require('../_shared/db');

function createError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

exports.main = async (event = {}) => {
  const db = initCloudDb();
  const context = cloud.getWXContext();
  const currentUserId = event.ownerUserId || event.currentUserId || context.OPENID;
  const now = new Date().toISOString();

  if (event.action === 'create') {
    if (event.type === 'shared' && !event.spaceId) {
      throw createError('Shared lists require a space', 'SPACE_REQUIRED');
    }

    const payload = {
      name: event.name,
      type: event.type,
      ownerUserId: currentUserId,
      spaceId: event.type === 'shared' ? event.spaceId : null,
      color: event.color || '#d8d0c7',
      sortOrder: event.sortOrder || 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection('lists').add({
      data: payload,
    });

    return {
      ...payload,
      listId: result._id,
    };
  }

  if (event.action === 'rename') {
    const snapshot = await db.collection('lists').doc(event.listId).get();
    const list = snapshot.data;

    if (!list) {
      throw createError('List not found', 'LIST_NOT_FOUND');
    }

    if (list.type === 'private' && list.ownerUserId !== currentUserId) {
      throw createError('Cannot rename another users private list', 'FORBIDDEN');
    }

    await db.collection('lists').doc(event.listId).update({
      data: {
        name: event.name,
        updatedAt: now,
      },
    });

    return {
      ...list,
      listId: event.listId,
      name: event.name,
      updatedAt: now,
    };
  }

  throw createError('Unsupported list action', 'UNSUPPORTED_ACTION');
};
