const Joi = require('joi');

exports.createProjectValidationSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  members: Joi.array().items(Joi.string()).optional(),
  startDate: Joi.date().required(),
  dueDate: Joi.date().required(),
  scope: Joi.string().valid('Public', 'Team').default('Team'),
  status: Joi.string()
    .valid('To Do', 'In Progress', 'Done', 'Issue')
    .default('To Do'),
  priority: Joi.number().integer().min(0).max(4).default(0),
});

exports.updateProjectValidationSchema = Joi.object({
  status: Joi.string()
    .valid('To Do', 'In Progress', 'Done', 'Issue')
    .optional(),
  scope: Joi.string().valid('Public', 'Team'),
  startDate: Joi.date().optional(),
  dueDate: Joi.date().optional(),
  priority: Joi.number().integer().min(0).max(4).optional(),
}).min(1);
