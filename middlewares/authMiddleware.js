import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/errorHandler.js";

// Authentication Middleware: Ensures user is logged in
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError("No token provided, authorization denied", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user details with role only (reduces DB load)
      const user = await User.findOne({ userId: decoded.userId }).select("role passwordChangedAt");
      if (!user) {
        throw new ApiError("User no longer exists", 401);
      }

      // Check if password was changed after token was issued
      if (user.passwordChangedAt && user.passwordChangedAt instanceof Date) {
        const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
        if (decoded.iat < changedTimestamp) {
          throw new ApiError("User recently changed password, please login again", 401);
        }
      }

      req.user = { userId: decoded.userId, role: user.role }; // Attach minimal user data
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);

      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError("Token expired", 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError("Invalid token", 401);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Role-Based Access Middleware 
export const roleMiddleware = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        throw new ApiError("Access denied", 403);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authMiddleware;
