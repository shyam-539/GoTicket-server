import express from "express";
import { celebrate, Segments } from "celebrate";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware.js"; // ✅ FIXED
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
  celebrate({ [Segments.BODY]: loginSchema[Segments.BODY] }),
  login
);

router.post("/refresh-token", (req, res, next) => {
  if (!req.cookies?.refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }
  next();
}, refreshToken);

router.post("/logout", authenticateUser, logout); 

router.get("/profile", authenticateUser, getUserProfile); 

router.put(
  "/profile",
  authenticateUser, 
  celebrate({ [Segments.BODY]: updateProfileSchema[Segments.BODY] }),
  updateUserProfile
);

router.post(
  "/upload-profile-pic",
  authenticateUser, 
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
  authenticateUser, 
  celebrate({ [Segments.BODY]: changePasswordSchema[Segments.BODY] }),
  changePassword
);

router.delete("/account", authenticateUser, deleteAccount); 

export default router;
