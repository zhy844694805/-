const { initCloudDb, cloud } = require('../_shared/db');

function createError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

exports.main = async (event = {}) => {
  const db = initCloudDb();
  const context = cloud.getWXContext();
  const viewerUserId = event.viewerUserId || context.OPENID;
  const now = new Date().toISOString();

  const taskSnapshot = await db.collection('tasks').doc(event.taskId).get();
  const task = taskSnapshot.data;

  if (!task) {
    throw createError('Task not found', 'TASK_NOT_FOUND');
  }

  const listSnapshot = await db.collection('lists').doc(task.listId).get();
  const list = listSnapshot.data;

  if (!list) {
    throw createError('List not found', 'LIST_NOT_FOUND');
  }

  if (list.type === 'private' && list.ownerUserId !== viewerUserId) {
    throw createError('Cannot toggle another users private task', 'FORBIDDEN');
  }

  await db.collection('tasks').doc(event.taskId).update({
    data: {
      isCompleted: Boolean(event.isCompleted),
      updatedBy: viewerUserId,
      updatedAt: now,
    },
  });

  return {
    ...task,
    taskId: event.taskId,
    isCompleted: Boolean(event.isCompleted),
    updatedBy: viewerUserId,
    updatedAt: now,
  };
};
