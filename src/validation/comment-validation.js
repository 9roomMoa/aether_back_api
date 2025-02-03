const Joi = require('joi');

exports.creatingSchema = Joi.object({
  commenterId: Joi.string().required(),
  content: Joi.string().required(),
  parentId: Joi.string().optional(),
});

exports.updatingSchema = Joi.object({
  userId: Joi.string().required(),
  content: Joi.string().required(),
});
