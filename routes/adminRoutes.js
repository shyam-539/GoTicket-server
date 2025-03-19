import express from "express";
import {
  adminLogin,
  adminLogout,
  adminProfile,
  deleteTheater,
  deleteUser,
  getAdminNotifications,
  getAllTheater,
  getAllUsers,
  markNotificationAsReadAndVerify,
} from "../controllers/adminController.js";

import { authorizedAdmin } from "../middlewares/adminAuthMiddleware.js";
import {
  authorizedTheaterOwnerOrAdmin,
  verifyMovieAccess,
} from "../middlewares/authorizeRoles.js";

import {
  addMovie,
  updateMovie,
  deleteMovie,
  getAllMovies,
} from "../controllers/movieController.js";

const router = express.Router();

// 🔹 Admin Authentication Routes
router.post("/login", adminLogin);
router.post("/logout", authorizedAdmin, adminLogout);
router.get("/profile", authorizedAdmin, adminProfile);

// 🔹 Admin Notification Control Routes
router.get("/notifications", authorizedAdmin, getAdminNotifications);
router.put("/notifications/:id", authorizedAdmin, markNotificationAsReadAndVerify);

// 🔹 User Management Routes
router.get("/users", authorizedAdmin, getAllUsers);
router.delete("/users/:id", authorizedAdmin, deleteUser);

// 🔹 Theater Management Routes
router.get("/theaters", authorizedAdmin, getAllTheater);
router.delete("/theaters/:id", authorizedAdmin, deleteTheater);

// 🔹 Movie Management Routes
router.get("/movies", authorizedAdmin, getAllMovies);
router.post("/movies", verifyMovieAccess, authorizedTheaterOwnerOrAdmin, addMovie);
router.put("/movies/:id", verifyMovieAccess, authorizedTheaterOwnerOrAdmin, updateMovie);
router.delete("/movies/:id", verifyMovieAccess, authorizedTheaterOwnerOrAdmin, deleteMovie);

// 🔹 Booking Reports Routes (not implemented yet)
// router.get("/bookings", authorizedAdmin);
// router.get("/revenue", authorizedAdmin);

// 🔹 Support & Feedback Routes (not implemented yet)
// router.get("/feedback", authorizedAdmin);
// router.delete("/feedback/:id", authorizedAdmin);

export default router;
