const Project = require('../models/Project');
const Task = require('../models/Task');

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
  const existingTask = await Task.findById(tid);
  if (!existingTask) {
    throw new Error('Invalid Task ID');
  } else {
    return existingTask;
  }
};
