const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Comment = require('../models/Comment');
const taskUtil = require('../utils/task-util');

exports.createTask = async (taskData, userId) => {
  try {
    const isExistingProject = await taskUtil.isExistingResource(
      Project,
      taskData.project
    );

    if (!isExistingProject) {
      throw new Error('No project found');
    }
    if (!(await taskUtil.projectScopeChecker(userId, isExistingProject))) {
      throw new Error('you dont have privilege to access this project');
    }
    const task = new Task(taskData);
    await task.save();

    return task;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during creating new task');
  }
};

exports.getTaskInfo = async (tid, userId) => {
  try {
    const existingTask = await Task.findById(tid).lean();
    if (!existingTask) {
      throw new Error('Invalid Task ID');
    }
    const creator = await User.findById(existingTask.createdBy);

    const isAcceptable = await taskUtil.scopeChecker(userId, existingTask);

    if (!isAcceptable) {
      throw new Error('User not includes in this task');
    }

    return {
      ...existingTask,
      creator: creator.name,
    };
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during getting task information');
  }
};

exports.getAllTasks = async (project) => {
  try {
    const existingProject = await Project.findById(project);
    if (!existingProject) {
      throw new Error('Invalid Project ID');
    }
    const task = await Task.find({ project: project }).select(
      'title description status priority'
    );

    return task;
  } catch (err) {
    console.error(err);
    throw new Error('Error during getting tasks');
  }
};

exports.deleteTask = async (userId, taskId) => {
  try {
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      throw new Error('Invalid Task ID');
    }
    const isCreator = taskUtil.isTaskCreator(userId, existingTask);
    if (!isCreator) {
      throw new Error('You dont have privilege to delete this task');
    }

    await Task.findByIdAndDelete(taskId);

    return { success: true, message: 'Task successfully deleted' };
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during deleting a task');
  }
};

exports.getManagerInfo = async (userId, taskId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Invalid user id');
    }
    const existingTask = await Task.findById(taskId);
    const task = await Task.findById(taskId)
      .populate('createdBy assignedTo', 'name email')
      .lean();

    if (!task) {
      throw new Error('Invalid task id');
    }

    const isAccessible = await taskUtil.scopeChecker(userId, existingTask);

    if (!isAccessible) {
      throw new Error('You dont have privilege to get info');
    }

    const result = {
      createdBy: task.createdBy,
      assignedTo: task.assignedTo,
    };
    return result;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during getting Manager info');
  }
};

exports.addManagers = async (taskId, userId, managerId) => {
  try {
    const task = await taskUtil.isExistingResource(Task, taskId);
    await taskUtil.isExistingResource(User, userId);
    const isAccessible = await taskUtil.isTaskCreator(userId, task);
    if (!isAccessible) {
      throw new Error('You dont have privilege to add managers');
    }
    await taskUtil.isExistingResource(User, managerId);

    const updatedTask = Task.findByIdAndUpdate(
      taskId,
      {
        $addToSet: { assignedTo: managerId },
      },
      { new: true }
    );

    return updatedTask;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during adding managers');
  }
};

exports.searchComments = async (keyword, taskId, userId) => {
  try {
    const task = await taskUtil.isExistingResource(Task, taskId);

    const isAccessible = await taskUtil.scopeChecker(userId, task);
    if (!isAccessible) {
      throw new Error('You dont have privilege to access to comments');
    }
    console.log(keyword);
    const comments = await Comment.find({
      taskId: taskId,
      content: { $regex: keyword, $options: 'i' },
    });

    return comments;
  } catch (err) {
    console.error(err);
    throw new Error('error occured during searching comments');
  }
};

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
