import express from "express";
import {
  getBookings,
  getMovie,
  getShows,
  ownerForgotPassword,
  ownerLogin,
  ownerLogout,
  ownerPasswordChange,
  OwnerProfile,
  ownerProfileDeactivate,
  ownerProfileEdit,
  ownerSignup,
} from "../controllers/theaterOwnerController.js";

import { authorizeTheaterOwner } from "../middlewares/theaterOwnerAuthMiddleware.js";
import {
  addMovie,
  deleteMovie,
  getAllMovies,
  updateMovie,
} from "../controllers/movieController.js";

import {
  authorizedTheaterOwnerOrAdmin,
  verifyMovieAccess,
} from "../middlewares/authorizeRoles.js";

import {
  addShow,
  deleteShow,
  editShow,
} from "../controllers/showController.js";

const router = express.Router();

// 🔹 Authentication Routes
router.post("/signup", ownerSignup);
router.post("/login", ownerLogin); 
router.post("/logout", ownerLogout);

// 🔹 User Profile Routes
router.get("/profile", authorizeTheaterOwner, OwnerProfile);
router.put("/profile-edit", authorizeTheaterOwner, ownerProfileEdit);
router.put("/profile-deactivate", authorizeTheaterOwner, ownerProfileDeactivate);

// 🔹 Password Management
router.put("/password-change", authorizeTheaterOwner, ownerPasswordChange);
router.post("/password-forgot", ownerForgotPassword);

// 🔹 Movie Management
router.get("/movies", authorizeTheaterOwner, getAllMovies);
router.get("/movies/:id", authorizeTheaterOwner, getMovie); // ✅ Changed from `/movie`
router.post("/movies", verifyMovieAccess, authorizedTheaterOwnerOrAdmin, addMovie);
router.put("/movies/:id", verifyMovieAccess, authorizedTheaterOwnerOrAdmin, updateMovie);
router.delete("/movies/:id", verifyMovieAccess, authorizedTheaterOwnerOrAdmin, deleteMovie);

// 🔹 Showtime Management
router.get("/showtimes", authorizeTheaterOwner, getShows);
router.post("/showtimes", authorizeTheaterOwner, addShow);
router.put("/showtimes/:id", authorizedTheaterOwnerOrAdmin, editShow);
router.delete("/showtimes/:id", authorizeTheaterOwner, deleteShow);

// 🔹 Booking Management
router.get("/bookings", authorizeTheaterOwner, getBookings);

// 🔹 Earnings Report (TODO)
// router.get("/earnings");

// 🔹 Customer Feedback (TODO)
// router.get("/feedbacks");
// router.post("/feedbacks/:id/reply");

// 🔹 Check if user exists (TODO)
// router.get("/check-user");

export default router;
