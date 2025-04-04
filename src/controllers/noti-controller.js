const { StatusCodes } = require('http-status-codes');
const notiService = require('../services/noti-service');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { pid } = req.params;

    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'User ID Omission',
      });
    }
    if (!pid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Project ID Omission',
      });
    }

    const notifications = await notiService.getNotifications(userId, pid);

    return res.status(StatusCodes.OK).json({
      data: notifications,
      success: true,
      meessage: 'Notifications retrieved successfully',
    });
  } catch (err) {
    if (err.message === 'PROJECT_NOT_FOUND') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid project ID',
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};
