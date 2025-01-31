const User = require('../models/User');
const Project = require('../models/Project');
const taskUtils = require('../utils/task-util');

exports.createProject = async (data) => {
  try {
    const isTeamMember = await User.findById(data.createdBy);

    if (!isTeamMember) {
      throw new Error('You are not in team');
    }
    if (data.members && !Array.isArray(data.members)) {
      data.members = [data.members];
    }
    const result = await Project.create(data);

    return result;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during creating a project');
  }
};

exports.patchProject = async (pid, userId, data) => {
  try {
    const isExistingProject = await taskUtils.isExistingResource(Project, pid);
    if (!isExistingProject) {
      throw new Error('No project found');
    }
    if (!(await taskUtils.isProjectCreator(userId, isExistingProject))) {
      throw new Error('you dont have privilege to update this project');
    }
    if (
      taskUtils.isInvalidDateRange(
        data?.startDate || isExistingProject.startDate,
        data?.dueDate || isExistingProject.dueDate
      )
    ) {
      throw new Error('date data are invalidate');
    }
    const updatedProject = await Project.findByIdAndUpdate(
      pid,
      {
        $set: data,
      },
      { new: true, runValidators: true }
    );

    return updatedProject;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during updating a project');
  }
};
