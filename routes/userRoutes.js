import express from "express";
import { celebrate, Segments } from "celebrate";
import authMiddleware from "../middlewares/authMiddleware.js";
import validateSignup from "../middlewares/validateSignup.js";
import rateLimit from "express-rate-limit";
import upload from "../utils/multerConfig.js";
import {
  signup,
  login,
  refreshToken,
  logout,
  getUserProfile,
  updateUserProfile,
  uploadProfilePic,
  changePassword,
  deleteAccount,
} from "../controllers/userController.js";

import {
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/userValidators.js";

const router = express.Router();

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_LOGIN_ATTEMPTS || 10,
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
router.post("/signup", validateSignup, signup);

router.post(
  "/login",
  loginLimiter,
  celebrate({ [Segments.BODY]: loginSchema[Segments.BODY] }), // FIXED usage
  login
);

router.post("/refresh-token", (req, res, next) => {
  if (!req.cookies?.refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }
  next();
}, refreshToken);

router.post("/logout", authMiddleware, logout);

router.get("/profile", authMiddleware, getUserProfile);

router.put(
  "/profile",
  authMiddleware,
  celebrate({ [Segments.BODY]: updateProfileSchema[Segments.BODY] }), // FIXED usage
  updateUserProfile
);

router.post(
  "/upload-profile-pic",
  authMiddleware,
  (req, res, next) => {
    upload.single("profilePic")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  uploadProfilePic
);

router.post(
  "/change-password",
  authMiddleware,
  celebrate({ [Segments.BODY]: changePasswordSchema[Segments.BODY] }), // FIXED usage
  changePassword
);

router.delete("/account", authMiddleware, deleteAccount);

export default router;
