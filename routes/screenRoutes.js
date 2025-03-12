import express from "express";
import { 
  createScreen, 
  getScreensByTheater,
  updateScreen,
  deleteScreen
} from "../controllers/screenController.js";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Screen routes
router
  .route("/")
  .post(authorizeRoles(["theater-owner"]), createScreen); // Create screen

router
  .route("/theater/:theaterId")
  .get(authorizeRoles(["theater-owner", "admin"]), getScreensByTheater); // Get screens by theater

router
  .route("/:id")
  .patch(authorizeRoles(["theater-owner"]), updateScreen) // Update screen
  .delete(authorizeRoles(["theater-owner"]), deleteScreen); // Delete screen

export default router;
