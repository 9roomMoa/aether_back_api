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

exports.getAllUserInfoByKeyword = async (userId, keyword) => {
  try {
    const filter = {
      _id: { $ne: userId },
    };

    if (keyword) {
      filter.name = { $regex: keyword, $options: 'i' }; // 대소문자 구분 없이 검색
    }

    const userList = await User.find(filter).select('name rank');

    return userList;
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};
