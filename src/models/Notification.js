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
        'task_assigned', // 업무 할당
        'task_updated', // 업무 업데이트
        'task_deadline', // 업무 데드라인
        'comment_added', // 코멘트 추가
        'comment_updated', // 코멘트 업데이트
        'document_uploaded', // 문서 업로드
        'project_assigned', // 프로젝트 할당
        'project_updated', // 프로젝트 업데이트
      ],
    },
    relatedContent: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      content: {
        type: String,
        enum: ['Task', 'Comment', 'Document', 'Project'],
      },
    },
    // relatedTask: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Task',
    //   default: null,
    // },
    // relatedComment: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Comment',
    //   default: null,
    // },
    // relatedDocument: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   default: null,
    // },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
