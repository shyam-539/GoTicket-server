import express from "express";
import authMiddleware, { adminMiddleware } from "../middlewares/authMiddleware.js";
import { getAllUsers, deleteUser, getAllTheaters, deleteTheater } from "../controllers/adminController.js";

const router = express.Router();

// GET all users (Admins only)
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

// DELETE a user (Admins only)
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

// GET all theaters (Admins only)
router.get("/theaters", authMiddleware, adminMiddleware, getAllTheaters);

// DELETE a theater (Admins only)
router.delete("/theaters/:id", authMiddleware, adminMiddleware, deleteTheater);

export default router;
