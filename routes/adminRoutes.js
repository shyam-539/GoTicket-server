import express from "express";
import { 
  adminLogin,
  getDashboardStats,
  getAllTheaters,
  updateTheaterStatus,
  getAllMovies,
  updateMovieStatus,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getRevenueReports
} from "../controllers/adminController.js";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin login route
router.post("/login", adminLogin);  // Add this route to handle admin login

// Apply authentication and admin role authorization to all routes
router.use(authenticateUser, authorizeRoles("admin"));

// Dashboard statistics
router.get("/dashboard", getDashboardStats);

// Theater management routes
router.get("/theaters", getAllTheaters);
router.patch("/theaters/:theaterId/status", updateTheaterStatus);

// Movie management routes
router.get("/movies", getAllMovies);
router.patch("/movies/:movieId/status", updateMovieStatus);

// User management routes
router.get("/users", getAllUsers);
router.patch("/users/:userId/status", updateUserStatus);
router.patch("/users/:userId/role", updateUserRole);

// Revenue reports (future scope)
router.get("/revenue", getRevenueReports);

export default router;