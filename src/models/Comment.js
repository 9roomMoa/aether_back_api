const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  commenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  content: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Comment', commentSchema);
