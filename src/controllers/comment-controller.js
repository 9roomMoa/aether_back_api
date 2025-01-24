const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');
const commentService = require('../services/comment-service');

const commentValidationSchema = Joi.object({
  commenterId: Joi.string().required(),
  content: Joi.string().required(),
  parentId: Joi.string().optional(),
});

exports.createComment = async (req, res) => {
  try {
    const { tid } = req.params;
    const { error, value } = commentValidationSchema.validate(req.body);

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
