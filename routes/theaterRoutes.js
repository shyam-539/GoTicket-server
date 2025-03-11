import express from "express";
import { celebrate } from "celebrate";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createTheater,
  getTheaters,
  getTheaterById,
  updateTheater,
  deleteTheater,
  addShow,
} from "../controllers/theaterController.js";
import { theaterSchema, showSchema } from "../validators/theaterValidators.js";

const router = express.Router();

// CREATE Theater (Only for theater-owners)
router.post(
  "/",
  authMiddleware(["theater-owner"]),
  celebrate({ body: theaterSchema }),
  createTheater
);

// GET all theaters
router.get("/", getTheaters);

// GET single theater by ID
router.get("/:id", getTheaterById);

// UPDATE theater details (Only owner of the theater)
router.put(
  "/:id",
  authMiddleware(["theater-owner"]),
  celebrate({ body: theaterSchema }),
  updateTheater
);

// DELETE theater (Only owner of the theater)
router.delete("/:id", authMiddleware(["theater-owner"]), deleteTheater);

// ADD a show to a theater (Only owner)
router.post(
  "/:id/shows",
  authMiddleware(["theater-owner"]),
  celebrate({ body: showSchema }),
  addShow
);

export default router;
