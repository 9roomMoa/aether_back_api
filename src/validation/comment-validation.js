const Joi = require('joi');

exports.creatingSchema = Joi.object({
  content: Joi.string().required(),
  parentId: Joi.string().optional(),
});

exports.updatingSchema = Joi.object({
  content: Joi.string().required(),
});
