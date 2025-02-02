const Joi = require('joi');

exports.gettingSchema = Joi.object({
  userId: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').default('To Do'),
  priority: Joi.number().integer().min(1).max(5),
  project: Joi.string().required(), // 프로젝트 ID
  assignedTo: Joi.array().items(Joi.string()).optional(), // 사용자 ID
  createdBy: Joi.string().required(), // 생성자 ID
  startDate: Joi.date().optional(),
  dueDate: Joi.date().optional(),
});

//상태, 공개여부, 일정, 우선선위
exports.updatingSchema = Joi.object({
  userId: Joi.string().required(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').optional(),
  priority: Joi.number().integer().min(1).max(5).optional(),
  startDate: Joi.date().optional(),
  dueDate: Joi.date().optional(),
}).min(2);
