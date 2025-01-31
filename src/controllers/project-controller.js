const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');
const taskUtil = require('../utils/task-util');
const projectService = require('../services/project-service');

const projectValidationSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  members: Joi.array().items(Joi.string()).optional(),
  createdBy: Joi.string().required(),
  startDate: Joi.date().required(),
  dueDate: Joi.date().required(),
  scope: Joi.string().valid('Public', 'Team').default('Team'),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').default('To Do'),
});

exports.createProject = async (req, res) => {
  try {
    const { error, value } = projectValidationSchema.validate(req.body);

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid input data: ' + error.details,
      });
    }

    const projectData = {
      createdBy: req.user?.id || value.createdBy,
      ...value,
    };

    if (
      taskUtil.isInvalidDateRange(projectData.startDate, projectData.dueDate)
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid date range',
      });
    }

    const project = await projectService.createProject(projectData);

    return res.status(StatusCodes.CREATED).json({
      data: project,
      success: true,
      message: 'project created successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};
