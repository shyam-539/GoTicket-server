import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { TheaterOwner } from "../models/Theater.js";
import { Admin } from "../models/Admin.js";

// Function to generate access token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: "15m" });
};

// Function to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
};

// Unified Login Function
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check in User collection
    let user = await User.findOne({ email });
    let role = "user";

    // Check in TheaterOwner collection if not found in User
    if (!user) {
      user = await TheaterOwner.findOne({ email });
      role = "theaterOwner";
      if (user && !user.isVerified) {
        return res.status(400).json({ message: "User account is not Verified" });
      }
    }

    // Check in Admin collection if not found in both
    if (!user) {
      user = await Admin.findOne({ email });
      role = "admin";
    }

    // If user does not exist
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate Tokens
    const accessToken = generateAccessToken({ _id: user._id, role });
    const refreshToken = generateRefreshToken({ _id: user._id, role });

    // Store refresh token in an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/api/auth/refresh-token",
    });

    // Send response with access token
    res.status(200).json({ message: "Login successful", role, accessToken });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Refresh Token Route
export const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Unauthorized - No refresh token" });

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden - Invalid refresh token" });

    const newAccessToken = generateAccessToken({ _id: user.id, role: user.role });
    res.status(200).json({ accessToken: newAccessToken });
  });
};

// Logout Route
export const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", { path: "/api/auth/refresh-token" });
  res.status(200).json({ message: "Logged out successfully" });
};
