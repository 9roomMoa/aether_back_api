const { StatusCodes } = require('http-status-codes');
const userService = require('../services/user-service');

exports.getUserInfoByKeyword = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { keyword } = req.query;
    const projectId = req.params.pid;

    if (!userId)
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'User ID Omission',
      });

    if (!projectId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Project ID Omission',
      });
    }

    const userList = await userService.getUserInfoByKeyword(
      userId,
      projectId,
      keyword
    );
    if (!userList || userList.length === 0) {
      return res.status(StatusCodes.NO_CONTENT).json({
        success: true,
        message: 'No member found',
      });
    }

    return res.status(StatusCodes.OK).json({
      data: userList,
      success: true,
      message: 'User info retrieved successfully',
    });
  } catch (err) {
    if (err.message === 'Project not found') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: err.message,
      });
    }

    if (err.message === 'You dont have privilege to access this project') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};

exports.getAllUserInfoByKeyword = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { keyword } = req.query;
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'userID omission',
      });
    }

    if (!keyword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '이름을 입력해주세요.',
      });
    }

    const userList = await userService.getAllUserInfoByKeyword(userId, keyword);

    if (!userList || userList.length === 0) {
      return res.status(StatusCodes.NO_CONTENT).json({
        success: true,
        message: 'No member found',
      });
    }

    return res.status(StatusCodes.OK).json({
      data: userList,
      success: true,
      message: 'User info retrieved successfully',
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
