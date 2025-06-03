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
          project: taskData.project,
          message: `새로운 업무가 할당되었습니다.`,
          receiver: uid,
          sender: userId,
          noticeType: 'TASK_ASSIGNED',
          relatedContent: {
            id: task._id,
            type: 'Task',
            taskTitle: taskData.title,
            projectTitle: isExistingProject.name,
          },
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

exports.getMyTasks = async (type, userId) => {
  try {
    const baseFilter = {
      $or: [{ assignedTo: userId }, { createdBy: userId }],
    };

    const sortOption = (() => {
      if (type === 'dueDate') return { dueDate: 1 };
      else if (type == 'priority') return { priority: -1 };
      return { dueDate: 1 };
    })();

    const filter =
      type === 'dueDate'
        ? {
            $and: [baseFilter, { dueDate: { $exists: true, $ne: null } }],
          }
        : baseFilter;
    const tasks = await Task.find(filter)
      .select('title description status priority project dueDate')
      .sort(sortOption)
      .limit(5);

    return tasks;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

exports.getAllTasks = async (type, project, userId) => {
  try {
    const existingProject = await Project.findById(project);
    if (!existingProject) {
      throw new Error('Invalid Project ID');
    }

    const hasAccess = await taskUtil.projectScopeChecker(
      userId,
      existingProject
    );
    if (!hasAccess) {
      throw new Error('You don’t have privilege to access this project');
    }

    const filter = {
      project: project,
      $or: [{ createdBy: userId }, { assignedTo: { $in: [userId] } }],
    };

    const sortOption = (() => {
      if (type === 'priority') return { priority: -1 };
      else if (type === 'dueDate') return { dueDate: 1 };
      return { dueDate: 1 };
    })();

    const task = await Task.find(filter)
      .select('title description status priority dueDate')
      .sort(sortOption);

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

    const projectTitle = await Project.findById(task.project).select('name');

    // if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
    //   const notifications = task.assignedTo
    //     .filter((uid) => uid.toString !== userId.toString)
    //     .map((uid) => ({
    //       project: taskData.project,
    //       message: `업무가 업데이트 되었습니다.`,
    //       receiver: uid,
    //       sender: userId,
    //       noticeType: 'TASK_UPDATED',
    //       relatedContent: {
    //         id: taskId,
    //         type: 'Task',
    //         taskTitle: task.title,
    //         projectTitle: projectTitle.name,
    //       },
    //     }));

    //   if (notifications.length > 0) {
    //     await Notification.insertMany(notifications);
    //   }
    // }
    const receivers = new Set();

    // 1. 할당자 중에서 작성자를 제외하고 알림 대상에 추가
    if (Array.isArray(task.assignedTo)) {
      task.assignedTo.forEach((uid) => {
        if (uid.toString() !== userId.toString()) {
          receivers.add(uid.toString());
        }
      });
    }

    // 2. 생성자가 작성자가 아니라면 추가
    if (task.createdBy && task.createdBy.toString() !== userId.toString()) {
      receivers.add(task.createdBy.toString());
    }

    // 3. 알림 생성
    const notifications = Array.from(receivers).map((receiverId) => ({
      project: taskData.project,
      message: `업무에 댓글이 등록되었습니다.`,
      receiver: receiverId,
      sender: userId,
      noticeType: 'TASK_COMMENTED',
      relatedContent: {
        id: taskId,
        type: 'Task',
        taskTitle: task.title,
        projectTitle: projectTitle.name,
      },
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
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

exports.addManagers = async (taskId, projectId, userId, managerId) => {
  try {
    const task = await taskUtil.isExistingResource(Task, taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    const isAccessible = await taskUtil.isTaskCreator(userId, task);
    if (!isAccessible) {
      const err = new Error('You do not have permission to assign managers');
      err.statusCode = 403;
      throw err;
    }

    const project = await Project.findById(projectId).select('name');
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    const isAlreadyAssigned = task.assignedTo
      .map((uid) => uid.toString())
      .includes(managerId.toString());

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $addToSet: { assignedTo: managerId } },
      { new: true }
    );

    if (!isAlreadyAssigned) {
      const notification = {
        project: projectId,
        message: '새로운 업무가 할당되었습니다.',
        receiver: managerId,
        sender: userId,
        noticeType: 'TASK_ASSIGNED',
        relatedContent: {
          id: taskId,
          type: 'Task',
          taskTitle: task.title,
          projectTitle: project.name,
        },
      };

      await Notification.create(notification);
    }

    return updatedTask;
  } catch (err) {
    console.error('Error in addManagers:', err.message);

    // statusCode가 없는 일반 오류면 500으로 세팅
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};
