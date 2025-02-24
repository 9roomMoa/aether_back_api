const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done', 'Issue', 'Hold'],
      default: 'To Do',
    },
    isDaily: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    projectScope: {
      type: String,
      enum: ['Public', 'Restricted'],
      default: 'Public',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
