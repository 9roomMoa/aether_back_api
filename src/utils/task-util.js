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

exports.creatorChecker = async (userId, task) => {
  return task.createdBy.toString() === userId;
};
