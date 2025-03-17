const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema(
  {
    message: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    noticeType: {
      type: String,
      enum: [
        'task_assigned',
        'task_updated',
        'task_deadline',
        'comment_added',
        'document_uploaded',
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
