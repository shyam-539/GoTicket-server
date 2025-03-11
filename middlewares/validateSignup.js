import { celebrate, Joi, Segments } from "celebrate";

const validateSignup = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name cannot exceed 50 characters",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .min(8)
      .required()
      .pattern(
        new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$")
      )
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "any.required": "Password is required",
        "string.pattern.base":
          "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
    role: Joi.string()
      .valid("user", "theater-owner", "admin")
      .default("user")
      .messages({
        "any.only": "Invalid role provided. Allowed roles: user, theater-owner, admin",
      }),
  }).unknown(false), // Rejects unexpected fields
});

export default validateSignup;
