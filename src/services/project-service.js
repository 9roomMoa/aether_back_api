const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Team = require('../models/Team');
const taskUtil = require('../utils/task-util');

exports.createProject = async (data) => {
  try {
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

exports.getProjectInfo = async (userId, pid) => {
  try {
    const isExistingProject = await taskUtil.isExistingResource(Project, pid);
    if (!isExistingProject) {
      const error = new Error('Project Not Found');
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }
    const isAccessible = await taskUtil.projectScopeChecker(
      userId,
      isExistingProject
    );

    if (!isAccessible) {
      const error = new Error('Cannot access to this project');
      error.statusCode = StatusCodes.NOT_ACCEPTABLE;
      throw error;
    }

    return isExistingProject;
  } catch (err) {
    throw err;
  }
};

exports.getAllProjects = async (userId, teamId) => {
  try {
    const isExistingTeam = await taskUtil.isExistingResource(Team, teamId);

    if (!isExistingTeam) {
      const error = new Error('Team not found');
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }
    const projects = await Project.find({
      $or: [{ createdBy: userId }, { members: { $in: [userId] } }],
    });

    return projects;
  } catch (err) {
    throw err;
  }
};

exports.getProjectMemberInfo = async (pid) => {
  try {
    const isExistingProject = await taskUtil.isExistingResource(Project, pid);
    if (!isExistingProject) {
      const error = new Error('No Project Found');
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }

    const project = await Project.findById(pid)
      .populate('createdBy', 'name rank')
      .populate('members', 'name rank');

    const creator = project.createdBy;
    const members = project.members;

    return {
      creator,
      members,
    };
  } catch (err) {
    throw err;
  }
};

exports.patchProject = async (pid, userId, data) => {
  try {
    const isExistingProject = await taskUtil.isExistingResource(Project, pid);
    if (!isExistingProject) {
      throw new Error('No project found');
    }
    if (!(await taskUtil.isProjectCreator(userId, isExistingProject))) {
      throw new Error('you dont have privilege to update this project');
    }
    if (
      taskUtil.isInvalidDateRange(
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

exports.addMembers = async (pid, userId, memberId) => {
  try {
    const isExistingProject = await taskUtil.isExistingResource(Project, pid);
    if (!isExistingProject) {
      const err = new Error('Project Not Found');
      err.statusCode = 404;
      throw err;
    }

    if (!(await taskUtil.isProjectCreator(userId, isExistingProject))) {
      const err = new Error('you dont have privilege to update this project');
      err.statusCode = StatusCodes.NOT_ACCEPTABLE;
      throw err;
    }

    const result = await Project.findByIdAndUpdate(
      pid,
      { $addToSet: { members: new mongoose.Types.ObjectId(memberId) } },
      { new: true }
    );

    return result;
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};
