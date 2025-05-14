const Notification = require('../models/Notification');
const Project = require('../models/Project');
const taskUtil = require('../utils/task-util');

exports.getNotifications = async (userId, projectId) => {
  try {
    const isExistingProject = await taskUtil.isExistingResource(
      Project,
      projectId
    );
    if (!isExistingProject) {
      throw new Error('PROJECT_NOT_FOUND');
    }
    const { notifications, unreadCount } = Promise.all([
      await Notification.find({ receiver: userId }).sort({ createdAt: -1 }),
      await Notification.countDocuments({ isRead: false, receiver: userId }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
