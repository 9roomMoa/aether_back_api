const Joi = require('joi');

exports.creatingNotificationSchema = Joi.object({
  message: Joi.string().required(),
  sender: Joi.string().required(),
  receiver: Joi.string().required(),
  noticeType: Joi.string().valid([
    'task_assigned', // 업무 할당
    'task_updated', // 업무 업데이트
    'task_deadline', // 업무 데드라인
    'comment_added', // 코멘트 추가
    'comment_updated', // 코멘트 업데이트
    'document_uploaded', // 문서 업로드
    'project_assigned', // 프로젝트 할당
    'project_updated', // 프로젝트 업데이트
  ]),
  relatedContent: Joi.object({
    id: Joi.string().required(),
    content: Joi.string().valid('Task', 'Comment', 'Project', 'Document'),
  }).optional(),
  // relatedTask: Joi.string().optional(),
  // relatedComment: Joi.string().optional(),
  // relatedComment: Joi.string().optional(),
  // relatedDocument: Joi.string().optional(),
  isRead: Joi.string().required(),
});
