const Task = require('../models/Task');
const User = require('../models/User');
const Comment = require('../models/Comment');
const taskUtil = require('../utils/task-util');
const Notification = require('../models/Notification');

exports.searchComments = async (keyword, taskId, userId) => {
  try {
    const task = await taskUtil.isExistingResource(Task, taskId);

    const isAccessible = await taskUtil.scopeChecker(userId, task);
    if (!isAccessible) {
      throw new Error('You dont have privilege to access to comments');
    }

    const comments = await Comment.find({
      taskId: taskId,
      content: { $regex: keyword, $options: 'i' },
    }).populate({
      path: 'commenterId',
      select: 'name',
    });

    return comments;
  } catch (err) {
    console.error(err);
    throw new Error('error occured during searching comments');
  }
};

exports.createComment = async (commentData) => {
  try {
    const isExistingTask = await taskUtil.isExistingResource(
      Task,
      commentData.taskId
    );
    if (!isExistingTask) {
      throw new Error('Invalid TaskId');
    }
    if (
      !(await taskUtil.scopeChecker(commentData.commenterId, isExistingTask))
    ) {
      throw new Error('You dont have privilege to create comment');
    }
    if (commentData.parentId) {
      const isChildComment = await Comment.findById(commentData.parentId);
      if (!isChildComment) {
        throw new Error('Comment does not have a parent comment');
      }
    }

    const comment = new Comment(commentData);
    await comment.save();

    const user = await User.findById(commentData.commenterId);
    const tasks = await Task.findById(commentData.taskId).select('assignedTo');

    const notifications = tasks.assignedTo
      .filter((uid) => uid.toString() !== commentData.commenterId.toString())
      .map((uid) => ({
        project: isExistingTask.project,
        message: `${user.name}님께서 [${isExistingTask.title}] 업무에 코멘트를 남기셨습니다.`,
        receiver: uid,
        sender: commentData.commenterId,
        noticeType: 'comment_added',
        relatedComment: comment._id,
        relatedTask: commentData.taskId,
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

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
      .populate({
        path: 'commenterId',
        select: 'name',
      })
      .sort({ createdAt: 1 })
      .lean();

    const commentMap = {};

    comments.forEach((comment) => {
      comment.replies = [];
      // comment.commenterName = User.findById(comment.commenterId).select('name');
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

exports.updateComment = async (userId, taskId, commentId, data) => {
  try {
    const isExistingTask = await taskUtil.isExistingResource(Task, taskId);
    if (!isExistingTask) {
      throw new Error('No task found');
    }
    const isExistingComment = await taskUtil.isExistingResource(
      Comment,
      commentId
    );
    if (!isExistingComment) {
      throw new Error('No comment found');
    }
    if (isExistingComment.commenterId.toString() !== userId) {
      throw new Error('You dont have privilege to update this comment');
    }
    const user = await User.findById(userId).select('name');

    const members = [...isExistingTask.assignedTo, isExistingTask.createdBy];
    const notifications = members
      .filter((uid) => uid.toString() !== userId)
      .map((uid) => ({
        project: isExistingTask.project,
        message: `${user.name}님이 [${isExistingTask.title}] 업무의 코멘트를 수정하였습니다.`,
        receiver: uid,
        sender: userId,
        noticeType: 'comment_updated',
        relatedComment: commentId,
        relatedTask: taskId,
      }));

    const result = await Comment.findByIdAndUpdate(
      commentId,
      { $set: data },
      { new: true, runValidators: true }
    );

    return result;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during updating comment');
  }
};

exports.deleteComment = async (userId, taskId, commentId) => {
  try {
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      throw new Error('Invalid task id');
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error('Invalid comment Id');
    }
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
