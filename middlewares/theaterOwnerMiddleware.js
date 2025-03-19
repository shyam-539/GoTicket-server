import jwt from "jsonwebtoken";
import { TheaterOwner } from "../models/Theater.js";

export const authorizeTheaterOwner = async (req, res, next) => {
  try {
    // Extract token from cookies or authorization header
    const token =
      req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No Token Provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Fetch theater owner details excluding password
    const theaterOwner = await TheaterOwner.findById(decoded.id).select("-password");

    if (!theaterOwner) {
      return res.status(404).json({ message: "Theater Owner Not Found" });
    }

    req.user = theaterOwner;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};
