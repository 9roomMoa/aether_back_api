const { StatusCodes } = require('http-status-codes');

const taskUtil = require('../utils/task-util');
const projectService = require('../services/project-service');
const projectValidation = require('../validation/project-validation');

exports.createProject = async (req, res) => {
  try {
    const { error, value } =
      projectValidation.createProjectValidationSchema.validate(req.body);

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

exports.patchProject = async (req, res) => {
  try {
    const { pid } = req.params;
    const { error, value } =
      projectValidation.updateProjectValidationSchema.validate(req.body);

    const { userId, ...updateData } = value;

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message:
          'Invalid input data: ' +
          error.details.map((d) => d.message).join(', '),
      });
    }

    if (!Object.keys(updateData).length) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No data provided for update',
      });
    }

    if (!pid) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No projectid provided',
      });
    }

    const result = await projectService.patchProject(pid, userId, updateData);

    return res.status(StatusCodes.OK).json({
      data: result,
      success: true,
      message: 'Project updated succesfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};
