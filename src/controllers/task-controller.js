const { StatusCodes } = require('http-status-codes');
const taskService = require('../services/task-service');
const taskUtil = require('../utils/task-util');
const taskValidation = require('../validation/task-validation');

exports.createTask = async (req, res) => {
  try {
    const { error, value } = taskValidation.creatingSchema.validate(req.body);

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid input data,' + error.details,
      });
    }
    const userId = req.user.sub;

    const { startDate, dueDate, ...taskData } = value;
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'User ID Omission',
      });
    }
    if (taskUtil.isInvalidDateRange(startDate, dueDate)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'start date cannot be later than due date',
      });
    }

    const task = await taskService.createTask(
      { ...taskData, startDate, dueDate },
      userId
    );

    return res.status(StatusCodes.CREATED).json({
      data: task,
      success: true,
      message: 'task created successfully',
    });
  } catch (err) {
    console.error('Internal Server Error', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const { pid } = req.params;
    const userId = req.user.sub;
    if (!pid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No Project Id',
      });
    }
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'User ID Omission',
      });
    }
    const tasks = await taskService.getAllTasks(pid, userId);

    if (!tasks || tasks.length === 0) {
      return res.status(StatusCodes.NO_CONTENT).json({
        success: true,
        message: 'No task found for the given projectId',
        data: [],
      });
    }

    const groupedTask = tasks.reduce((acc, task) => {
      acc[task.status] = acc[task.status] || [];
      acc[task.status].push(task);
      return acc;
    }, {});

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: groupedTask,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

exports.getTaskInfo = async (req, res) => {
  try {
    const { tid } = req.params;
    const userId = req.user?.sub;

    if (!tid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Task ID Omission',
      });
    }

    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'User ID Omission',
      });
    }
    const taskInfo = await taskService.getTaskInfo(tid, userId);

    return res.status(StatusCodes.OK).json({
      data: taskInfo,
      success: true,
      message: 'Task Info retrieved successfully!',
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};

exports.updateTaskInfo = async (req, res) => {
  try {
    const { tid } = req.params;
    const { error, value } = taskValidation.updatingSchema.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message:
          'Invalid input data: ' +
          error.details.map((err) => err.message).join(','),
      });
    }

    const userId = req.user?.sub;
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'User ID Omission',
      });
    }
    const taskData = value;
    const result = await taskService.updateTaskInfo(taskData, tid, userId);

    return res.status(StatusCodes.OK).json({
      data: result,
      success: true,
      message: 'Task updated successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { tid } = req.params;
    const userId = req.user?.sub;
    if (!tid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Task ID Omission',
      });
    }

    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'User ID Omission',
      });
    }

    await taskService.deleteTask(userId, tid);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal Server Error: ' + err.message,
    });
  }
};

exports.getManagerInfo = async (req, res) => {
  try {
    const { tid } = req.params;
    const userId = req.user?.sub;

    if (!tid || !userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'taskid and userid are must be required',
      });
    }

    const managers = await taskService.getManagerInfo(userId, tid);

    return res.status(StatusCodes.OK).json({
      data: managers,
      success: true,
      message: 'Managers info retrieved successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};

exports.addManagers = async (req, res) => {
  try {
    const { tid } = req.params;
    const { managerId, projectId } = req.body;
    const userId = req.user?.sub;

    if (!tid || !userId || !managerId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'taskId, userId, projectId and managerId must be required',
      });
    }

    const result = await taskService.addManagers(
      tid,
      projectId,
      userId,
      managerId
    );

    return res.status(StatusCodes.OK).json({
      data: result,
      success: true,
      message: 'Added successfully',
    });
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        message: err.message || 'Internal server error',
      });
  }
};
