const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getLandingPage = async (userId) => {
  try {
    const selectQuery = '_id name title description status startDate dueDate';
    const projectList = await Project.find({ members: userId }).select(
      selectQuery
    );
    const taskList = await Task.find({
      $or: [
        {
          createdBy: userId,
        },
        {
          assignedTo: userId,
        },
      ],
    }).select(selectQuery);
    return { projectList, taskList };
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during update landing page');
  }
};
