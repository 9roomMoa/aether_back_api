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

exports.getAllTasks = async (project) => {
  try {
    const existingProject = await Project.findById(project);
    if (!existingProject) {
      throw new Error('Invalid Project ID');
    }
    const task = await Task.find({ project: project });

    return task;
  } catch (err) {
    console.error(err);
    throw new Error('Error during getting tasks');
  }
};
