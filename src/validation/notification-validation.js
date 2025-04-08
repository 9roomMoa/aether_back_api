const Joi = require('joi');

exports.creatingNotificationSchema = Joi.object({
  message: Joi.string().required(),
  sender: Joi.string().required(),
  receiver: Joi.string().required(),
  noticeType: Joi.string().valid([
    'TASK_ASSIGNED', // 업무 할당
    'TASK_UPDATED', // 업무 업데이트
    'TASK_DEADLINE', // 업무 데드라인
    'COMMENT_ADDED', // 코멘트 추가
    'COMMENT_UPDATED', // 코멘트 업데이트
    'DOCUMENT_UPLOADED', // 문서 업로드
    'PROJECT_ASSIGNED', // 프로젝트 할당
    'PROJECT_UPDATED', // 프로젝트 업데이트
  ]),
  relatedContent: Joi.object({
    id: Joi.string().required(),
    type: Joi.string().valid('Task', 'Comment', 'Project', 'Document'),
  }).optional(),
  // relatedTask: Joi.string().optional(),
  // relatedComment: Joi.string().optional(),
  // relatedComment: Joi.string().optional(),
  // relatedDocument: Joi.string().optional(),
  isRead: Joi.string().required(),
});
