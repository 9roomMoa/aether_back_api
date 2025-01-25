const Comment = require('../models/Comment');
const Task = require('../models/Task');
const taskUtil = require('../utils/task-util');

exports.createComment = async (commentData) => {
  try {
    if (commentData.parentId) {
      const isChildComment = await Comment.findById(commentData.parentId);
      if (!isChildComment) {
        throw new Error('Comment does not have a parent comment');
      }
    }

    const comment = new Comment(commentData);
    await comment.save();

    return comment;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during creating comment');
  }
};

exports.getComments = async (userId, taskId) => {
  try {
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      throw new Error('No task found');
    }

    const isAvailable = await taskUtil.scopeChecker(userId, existingTask);
    if (!isAvailable) {
      throw new Error('No privilege to get the comments');
    }

    const comments = await Comment.find({ taskId })
      .sort({ createdAt: 1 })
      .lean();

    const commentMap = {};

    comments.forEach((comment) => {
      comment.replies = [];
      commentMap[comment._id] = comment;
    });

    const result = [];
    comments.forEach((comment) => {
      if (comment.parentId) {
        if (commentMap[comment.parentId]) {
          commentMap[comment.parentId].replies.push(comment);
        }
      } else {
        result.push(comment);
      }
    });

    return result;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during getting comments');
  }
};

exports.deleteComment = async (userId, taskId, commentId) => {
  try {
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      throw new Error('Invalid task id');
    }

    const comment = await Comment.findById(commentId);
    const isCreator = await taskUtil.isCommentCreator(userId, comment);

    if (!isCreator) {
      throw new Error('No privilege to delete this comment');
    }

    const result = await Comment.findByIdAndDelete(commentId);
    return result;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during deleting a comment');
  }
};
