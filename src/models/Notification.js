const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    message: { type: String, required: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    noticeType: {
      type: String,
      enum: [
        'TASK_ASSIGNED', // 업무 할당 V
        'TASK_UPDATED', // 업무 업데이트 V
        'TASK_DEADLINE', // 업무 데드라인
        'COMMENT_ADDED', // 코멘트 추가 V
        'COMMENT_UPDATED', // 코멘트 업데이트 V
        'DOCUMENT_UPLOADED', // 문서 업로드
        'PROJECT_ASSIGNED', // 프로젝트 할당
        'PROJECT_UPDATED', // 프로젝트 업데이트
      ],
    },
    relatedContent: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      type: {
        type: String,
        enum: ['Task', 'Comment', 'Document', 'Project'],
      },
      taskTitle: {
        type: String,
      },
      projectTitle: {
        type: String,
        required: true,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
