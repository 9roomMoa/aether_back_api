const User = require('../models/User');
const Project = require('../models/Project');

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
