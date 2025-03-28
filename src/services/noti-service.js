const taskUtil = require('../utils/task-util');

exports.getNotifications = async (userId) => {
  try {
    const [notifications, unreadCount] = Promise.all([
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
