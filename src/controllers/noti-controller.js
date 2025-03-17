const { StatusCodes } = require('http-status-codes');
const notiService = require('../services/noti-service');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'User ID Omission',
      });
    }
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};
