const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');
const taskService = require('../services/task-service');

const taskValidationSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').default('To Do'),
  priority: Joi.number().integer().min(1).max(5),
  project: Joi.string().required(), // 프로젝트 ID
  assignedTo: Joi.string().optional(), // 사용자 ID
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

    if (isInvalidDateRange(taskData.startDate, taskData.dueDate)) {
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

const isInvalidDateRange = (startDate, dueDate) => {
  if (!startDate || !dueDate) {
    return false;
  }
  const start = new Date(startDate);
  const due = new Date(dueDate);
  return start > due;
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
    const { tid } = req.params;
    const { userId } = req.body;

    if (!tid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalide Task ID',
      });
    }

    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid User ID',
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
