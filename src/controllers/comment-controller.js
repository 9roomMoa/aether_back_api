const { StatusCodes } = require('http-status-codes');
const commentService = require('../services/comment-service.js');
const commentValidation = require('../validation/comment-validation.js');

exports.searchComments = async (req, res) => {
  try {
    const { userId } = req.body;
    const { tid } = req.params;
    const { keyword } = req.query;

    if (!userId || !tid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'userId and taskId must be required',
      });
    }

    if (!keyword || keyword.trim() === '') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'there is no keyword',
      });
    }

    const comments = await commentService.searchComments(keyword, tid, userId);

    if (!comments) {
      return res.status(StatusCodes.OK).json({
        data: [],
        success: true,
        message: 'No comments',
      });
    }

    return res.status(StatusCodes.OK).json({
      data: comments,
      success: true,
      message: 'Comments retrieved succesfully',
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { tid } = req.params;
    const { error, value } = commentValidation.creatingSchema.validate(
      req.body
    );

    if (!tid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'TaskID omitted',
      });
    }

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid input data, ' + error.details,
      });
    }

    const commentData = { taskId: tid, ...value };

    const comment = await commentService.createComment(commentData);

    return res.status(StatusCodes.CREATED).json({
      data: comment,
      success: true,
      message: 'comment created successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal Server Error: ' + err.message,
    });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { tid } = req.params;
    const { userId } = req.body;

    if (!userId || !tid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'taskId and userId must be required',
      });
    }

    const comments = await commentService.getComments(userId, tid);

    return res.status(StatusCodes.OK).json({
      data: comments,
      success: true,
      message: 'Retrieved comments successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { tid, cid } = req.params;
    const { error, value } = commentValidation.updatingSchema.validate(
      req.body
    );

    if (!tid || !cid) {
      console.log(tid, cid);
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'taskId or commentId omitted',
      });
    }

    if (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message:
          'Invalid input data: ' +
          error.details.map((d) => d.message).join(','),
      });
    }

    const { userId, ...updateData } = value;
    const result = await commentService.updateComment(
      userId,
      tid,
      cid,
      updateData
    );

    return res.status(StatusCodes.OK).json({
      data: result,
      success: true,
      message: 'Comment updated successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: true,
      messasge: 'Internal server error: ' + err.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { tid } = req.params;
    const { userId, commentId } = req.body;

    if (!tid || !userId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'taskId and userId must be required',
      });
    }

    const result = await commentService.deleteComment(userId, tid, commentId);

    return res.status(StatusCodes.OK).json({
      data: result,
      success: true,
      message: 'comment deleted successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};
