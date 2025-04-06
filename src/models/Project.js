const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    scope: { type: String, enum: ['Public', 'Team'], default: 'Team' },
    priority: { type: Number, min: 0, max: 4, default: 0 },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done', 'Issue', 'Hold'],
      default: 'To Do',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
