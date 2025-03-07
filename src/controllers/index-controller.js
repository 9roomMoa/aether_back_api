const { StatusCodes } = require('http-status-codes');
const indexService = require('../services/index-service.js');

exports.getLandingPage = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'User ID Omission',
      });
    }

    const data = await indexService.getLandingPage(userId);

    if (!data || data.length === 0) {
      return res.status(StatusCodes.NO_CONTENT).json({
        success: true,
        message: 'No content found',
      });
    }

    return res.status(StatusCodes.OK).json({
      data: data,
      success: true,
      message: 'Data retrieved successfully',
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};
