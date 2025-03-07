const Joi = require('joi');

exports.creatingSchema = Joi.object({
  description: Joi.string().required(),
});
