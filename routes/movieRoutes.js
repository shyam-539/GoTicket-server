import express from "express";
import {
  addMovie,
  getAllApprovedMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  approveMovie,
  getMoviesByTheaterOwner,
} from "../controllers/movieController.js";
import { authenticateUser as protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Define roles
const admin = authorizeRoles("admin");
const theaterOwner = authorizeRoles("theaterOwner");

// Theater Owner adds a movie (Admin approval needed)
router.post("/", protect, theaterOwner, addMovie);

// Get all approved movies (Visible to users)
router.get("/", getAllApprovedMovies);

// Get movies added by a specific theater owner
router.get("/owner", protect, theaterOwner, getMoviesByTheaterOwner);

// Get a single movie by ID (Anyone can see if approved)
router.get("/:id", getMovieById);

// Theater Owner updates a movie (Only their own movies)
router.put("/:id", protect, theaterOwner, updateMovie);

// Admin approves a movie
router.put("/:id/approve", protect, admin, approveMovie);

// Admin deletes any movie, or Theater Owner deletes their own movie
router.delete("/:id", protect, authorizeRoles("admin", "theaterOwner"), deleteMovie);

export default router;
