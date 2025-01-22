const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

exports.createTask = async (taskData) => {
  try {
    const existingProject = await Project.findById(taskData.project);
    if (!existingProject) {
      throw new Error('Invalid Project ID');
    }
    const task = new Task(taskData);
    await task.save();

    return task;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during creating new task');
  }
};

exports.getTaskInfo = async (tid) => {
  const existingTask = await Task.findById(tid).lean();
  if (!existingTask) {
    throw new Error('Invalid Task ID');
  }
  const creator = await User.findById(existingTask.createdBy);
  if (!creator) {
    throw new Error('Invalid Creator Id');
  }

  return {
    ...existingTask,
    creator: creator.name,
  };
};
