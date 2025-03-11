import { Joi, Segments } from "celebrate";

export const loginSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const updateProfileSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
  }).min(1),
};

export const changePasswordSchema = {
  [Segments.BODY]: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .required()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .message(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  }),
};
