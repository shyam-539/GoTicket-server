import express from "express";
import { 
  createSeats, 
  getSeatsByScreen,
  updateSeat,
  bulkUpdateSeats,
  deleteSeat
} from "../controllers/seatController.js";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Seat creation
router.post("/", authorizeRoles(["theater-owner"]), createSeats);

// Fetch seats for a screen (Public Route)
router.get("/screen/:screenId", getSeatsByScreen);

// Seat updates and deletion
router
  .route("/:id")
  .patch(authorizeRoles(["theater-owner"]), updateSeat) // Update a single seat
  .delete(authorizeRoles(["theater-owner"]), deleteSeat); // Delete a seat

// Bulk seat update
router.post("/bulk-update", authorizeRoles(["theater-owner"]), bulkUpdateSeats);

export default router;
