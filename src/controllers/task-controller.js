const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');
const taskService = require('../services/task-service');
const taskUtil = require('../utils/task-util');

const taskValidationSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').default('To Do'),
  priority: Joi.number().integer().min(1).max(5),
  project: Joi.string().required(), // 프로젝트 ID
  assignedTo: Joi.array().items(Joi.string()).optional(), // 사용자 ID
  createdBy: Joi.string().required(), // 생성자 ID
  startDate: Joi.date().optional(),
  dueDate: Joi.date().optional(),
});

exports.createTask = async (req, res) => {
  try {
    const { error, value } = taskValidationSchema.validate(req.body);

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid input data,' + error.details,
      });
    }

    const taskData = value;

    if (taskUtil.isInvalidDateRange(taskData.startDate, taskData.dueDate)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'start date cannot be later than due date',
      });
    }

    const task = await taskService.createTask(taskData);

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
    const { project } = req.body;
    if (!project) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No Project Id',
      });
    }

    const tasks = await taskService.getAllTasks(project);

    if (!tasks || tasks.length === 0) {
      return res.status(StatusCodes.NO_CONTENT).json({
        success: true,
        message: 'No task found for the given project',
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
    const { taskId } = req.params;
    const { userId } = req.body;

    if (!taskId) {
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
    const taskInfo = await taskService.getTaskInfo(taskId, userId);

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

exports.deleteTask = async (req, res) => {
  try {
    const { taskId, userId } = req.body;
    if (!taskId) {
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

    await taskService.deleteTask(userId, taskId);

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
    const { userId } = req.body;

    if (!tid || !userId) {
      res.status(StatusCodes.BAD_REQUEST).json({
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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};

exports.addManagers = async (req, res) => {
  try {
    const { tid } = req.params;
    const { userId, managerId } = req.body;

    if (!tid || !userId || !managerId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'taskId, userId and managerId must be required',
      });
    }

    const result = await taskService.addManagers(tid, userId, managerId);

    return res.status(StatusCodes.OK).json({
      data: result,
      success: true,
      message: 'Added successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};

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

    const comments = await taskService.searchComments(keyword, tid, userId);

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

    const comment = await taskService.createComment(commentData);

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

    const comments = await taskService.getComments(userId, tid);

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

    const result = await taskService.deleteComment(userId, tid, commentId);

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
