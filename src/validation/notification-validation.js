const Joi = require('joi');

exports.creatingNotificationSchema = Joi.object({
  message: Joi.string().required(),
  sender: Joi.string().required(),
  receiver: Joi.string().required(),
  noticeType: Joi.string().valid([
    'task_assigned',
    'task_updated',
    'task_deadline',
    'comment_added',
    'document_uploaded',
    'project_added',
  ]),
  relatedTask: Joi.string().optional(),
  relatedComment: Joi.string().optional(),
  relatedComment: Joi.string().optional(),
  relatedDocument: Joi.string().optional(),
  isRead: Joi.string().required(),
});
