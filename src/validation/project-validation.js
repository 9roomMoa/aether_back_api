const Joi = require('joi');

exports.createProjectValidationSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  members: Joi.array().items(Joi.string()).optional(),
  createdBy: Joi.string().required(),
  startDate: Joi.date().required(),
  dueDate: Joi.date().required(),
  scope: Joi.string().valid('Public', 'Team').default('Team'),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').default('To Do'),
});

exports.updateProjectValidationSchema = Joi.object({
  userId: Joi.string().required(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').optional(),
  scope: Joi.string().valid('Public', 'Team'),
  startDate: Joi.date().optional(),
  dueDate: Joi.date().optional(),
}).min(2);
