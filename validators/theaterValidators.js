import { Joi } from "celebrate";

export const theaterSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  location: Joi.string().required(),
  totalSeats: Joi.number().min(1).required(),
  contactEmail: Joi.string().email().required(),
  contactPhone: Joi.string().pattern(/^\d{10}$/).required(),
});

export const showSchema = Joi.object({
  movieId: Joi.string().required(),
  showTime: Joi.date().required(),
});
