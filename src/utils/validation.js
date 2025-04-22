import Joi from 'joi';

export const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
  });

  return schema.validate(data);
};

export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

export const validateImageUpload = (req) => {
  const schema = Joi.object({
    name: Joi.string().max(100),
    description: Joi.string().max(500),
    tags: Joi.string().max(200),
  });

  return schema.validate(req.body);
};

export const validateUrlUpload = (data) => {
  const schema = Joi.object({
    imageUrl: Joi.string().required().uri(),
    name: Joi.string().max(100),
    description: Joi.string().max(500),
    tags: Joi.string().max(200),
  });

  return schema.validate(data);
};