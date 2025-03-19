import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { TheaterOwner } from "../models/Theater.js";
import { Admin } from "../models/Admin.js";

// Middleware to verify token and authenticate user role
export const verifyMovieAccess = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    let user;

    // Identify user role and fetch corresponding data
    switch (decoded.role) {
      case "user":
        user = await User.findById(decoded.id).select("-password");
        break;
      case "theaterOwner":
        user = await TheaterOwner.findById(decoded.id).select("-password");
        break;
      case "admin":
        user = await Admin.findById(decoded.id).select("-password");
        break;
      default:
        return res.status(403).json({ message: "Invalid Role" });
    }

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

// Role-based access control middleware
export const authorizedMovieUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access Denied: Users Only" });
  }
  next();
};

export const authorizedTheaterOwnerOrAdmin = (req, res, next) => {
  if (!["theaterOwner", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access Denied: Admins & Theater Owners Only" });
  }
  next();
};
