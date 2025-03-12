import express from "express";
import { 
  createTheater, 
  getTheatersByOwner, 
  getTheaterById,
  updateTheater,
  deleteTheater
} from "../controllers/theaterController.js";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Theater routes
router
  .route("/")
  .post(authorizeRoles(["theater-owner"]), createTheater) // Create theater
  .get(authorizeRoles(["theater-owner"]), getTheatersByOwner); // Get theaters by owner

router
  .route("/:id")
  .get(authorizeRoles(["theater-owner", "admin"]), getTheaterById) // Get theater by ID
  .patch(authorizeRoles(["theater-owner"]), updateTheater) // Update theater
  .delete(authorizeRoles(["theater-owner"]), deleteTheater); // Delete theater

export default router;
