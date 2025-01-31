exports.scopeChecker = async (userId, task) => {
  if (userId === task.createdBy.toString()) {
    return true;
  } else if (!task.assignedTo || !Array.isArray(task.assignedTo)) {
    return false;
  } else {
    return task.assignedTo.some(
      (assignUserId) => assignUserId.toString() === userId
    );
  }
};

exports.isTaskCreator = async (userId, task) => {
  return task.createdBy.toString() === userId;
};

exports.isCommentCreator = async (userId, comment) => {
  return comment.commenterId.toString() === userId;
};

exports.isExistingResource = async (Model, id) => {
  const resource = await Model.findById(id);
  if (!resource) {
    throw new Error(`invalid ${Model} id`);
  }
  return resource;
};

exports.isInvalidDateRange = (startDate, dueDate) => {
  if (!startDate || !dueDate) {
    return false;
  }
  const start = new Date(startDate);
  const due = new Date(dueDate);
  return start > due;
};

exports.isProjectCreator = async (userId, project) => {
  return project.createdBy.toString() === userId;
};
