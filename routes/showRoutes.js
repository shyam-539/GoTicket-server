import express from "express";
import { 
  createShow, 
  getShowsByTheater,
  updateShow,
  deleteShow
} from "../controllers/showController.js";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication except fetching shows
router.use(authenticateUser);

// Show routes
router
  .route("/")
  .post(authorizeRoles(["theater-owner"]), createShow); // Create a show

router
  .route("/theater/:theaterId")
  .get(getShowsByTheater); // Public route for fetching shows

router
  .route("/:id")
  .patch(authorizeRoles(["theater-owner"]), updateShow) // Update show
  .delete(authorizeRoles(["theater-owner"]), deleteShow); // Delete show

export default router;
