const { initCloudDb, cloud } = require('../_shared/db');

function createError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function assertListWritable(list, viewerUserId, viewerSpaceId) {
  if (!list) {
    throw createError('List not found', 'LIST_NOT_FOUND');
  }

  if (list.type === 'private' && list.ownerUserId !== viewerUserId) {
    throw createError('Cannot write to another users private list', 'FORBIDDEN');
  }

  if (list.type === 'shared' && list.spaceId !== viewerSpaceId) {
    throw createError('Cannot write outside the current space', 'FORBIDDEN');
  }
}

exports.main = async (event = {}) => {
  const db = initCloudDb();
  const context = cloud.getWXContext();
  const viewerUserId = event.viewerUserId || context.OPENID;
  const now = new Date().toISOString();

  const listSnapshot = await db.collection('lists').doc(event.listId).get();
  const list = listSnapshot.data;

  assertListWritable(list, viewerUserId, event.viewerSpaceId || null);

  const payload = {
    listId: event.listId,
    title: event.title,
    dueDateKey: event.dueDateKey,
    isCompleted: Boolean(event.isCompleted),
    assigneeUserIds: event.assigneeUserIds || [viewerUserId],
    createdBy: event.createdBy || viewerUserId,
    updatedBy: viewerUserId,
    createdAt: event.createdAt || now,
    updatedAt: now,
  };

  if (event.taskId) {
    await db.collection('tasks').doc(event.taskId).set({
      data: payload,
    });

    return {
      ...payload,
      taskId: event.taskId,
    };
  }

  const result = await db.collection('tasks').add({
    data: payload,
  });

  return {
    ...payload,
    taskId: result._id,
  };
};
