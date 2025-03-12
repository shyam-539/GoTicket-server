import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/errorHandler.js";

// Authentication Middleware: Ensures user is logged in
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return next(new ApiError("No token provided, authorization denied", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user with only required fields (avoiding unnecessary DB load)
      const user = await User.findById(decoded.userId).select("role passwordChangedAt");
      if (!user) {
        return next(new ApiError("User no longer exists", 401));
      }

      // Check if password was changed after token was issued
      if (user.passwordChangedAt instanceof Date) {
        const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
        if (decoded.iat < changedTimestamp) {
          return next(new ApiError("User recently changed password, please login again", 401));
        }
      }

      req.user = { userId: user._id, role: user.role }; // Attach minimal user data
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new ApiError("Token expired", 401));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new ApiError("Invalid token", 401));
      }
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

// Role-Based Access Middleware 
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ApiError("Access denied", 403));
  }
  next();
};

