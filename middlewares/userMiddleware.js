import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const authorizeUser = async (req, res, next) => {
  try {
    // Extract token from cookies or authorization header
    const token =
      req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

    // If no token is found, return an unauthorized response
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, No Token Provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Fetch user details from DB, excluding password
    const user = await User.findById(decoded.id).select("-password");

    // If user is not found, send a 404 response
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "User account is deactivated" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    
    // Differentiate token errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired, please login again" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token, please login again" });
    }

    res.status(401).json({ success: false, message: "Invalid or Expired Token" });
  }
};
