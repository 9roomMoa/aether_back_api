const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
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
    const task = new Task({ ...taskData, createdBy: userId });
    await task.save();

    if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
      const notifications = task.assignedTo
        .filter((uid) => uid.toString() !== userId.toString())
        .map((uid) => ({
          message: `${task.title} 업무가 할당되었습니다.`,
          receiver: uid,
          sender: userId,
          noticeType: 'task_assigned',
          relatedTask: task._id,
        }));

      if (notifications.length > 0)
        await Notification.insertMany(notifications);
    }

    return task;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during creating new task');
  }
};

exports.getAllTasks = async (project, userId) => {
  try {
    const existingProject = await Project.findById(project);
    if (!existingProject) {
      throw new Error('Invalid Project ID');
    }
    if (!(await taskUtil.projectScopeChecker(userId, existingProject))) {
      throw new Error('You dont have privilege to access this project');
    }
    const task = await Task.find({
      project: project,
      $or: [{ createdBy: userId }, { assignedTo: { $in: [userId] } }],
    }).select('title description status priority');

    return task;
  } catch (err) {
    console.error(err);
    throw new Error('Error during getting tasks');
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
      rank: creator.rank,
    };
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during getting task information');
  }
};

exports.updateTaskInfo = async (taskData, taskId, userId) => {
  try {
    const isExistingTask = await taskUtil.isExistingResource(Task, taskId);
    if (!isExistingTask) {
      throw new Error('No task found');
    }

    const isAccessible = await taskUtil.scopeChecker(userId, isExistingTask);

    if (!isAccessible) {
      throw new Error('you dont have privilege to update this task');
    }

    if (
      taskUtil.isInvalidDateRange(
        taskData?.startDate || isExistingTask.startDate,
        taskData?.dueDate || isExistingTask.dueDate
      )
    ) {
      throw new Error('date data are invalidate');
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        $set: taskData,
      },
      { new: true, runValidators: true }
    );

    if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
      const notifications = task.assignedTo
        .filter((uid) => uid.toString !== userId.toString)
        .map((uid) => ({
          message: `${task.title} 업무가 업데이트 되었습니다.`,
          receiver: uid,
          sender: userId,
          noticeType: 'task_updated',
          relatedTask: task._id,
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    return task;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during updating task');
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

    const alreadyAssigned = task.assignedTo.map((uid) => uid.toString());

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $addToSet: { assignedTo: managerId },
      },
      { new: true }
    );

    if (
      !alreadyAssigned.includes(managerId.toString()) &&
      updatedTask.assignedTo.length > 0
    ) {
      const notification = {
        message: `${updatedTask.title} 업무가 할당되었습니다.`,
        receiver: managerId,
        sender: userId,
        noticeType: 'task_assigned',
        relatedTask: updatedTask._id,
      };

      await Notification.create(notification);
    }

    return updatedTask;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during adding managers');
  }
};
