const User = require('../models/User');
const Project = require('../models/Project');
const taskUtil = require('../utils/task-util');

exports.getUserInfoByKeyword = async (userId, projectId, keyword) => {
  try {
    const isExistingProject = await taskUtil.isExistingResource(
      Project,
      projectId
    );

    if (!isExistingProject) {
      throw new Error('Project not found');
    }

    if (!(await taskUtil.projectScopeChecker(userId, isExistingProject))) {
      throw new Error('You dont have privilege to access this project');
    }

    const query = {
      _id: { $in: isExistingProject.members },
    };

    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    const users = await User.find(query).select('_id name email rank role');
    return users;
  } catch (err) {
    throw err;
  }
};
