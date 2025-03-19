import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";

const generateAccessToken = (admin) => {
  return jwt.sign({ id: admin._id, role: "admin" }, process.env.SECRET_KEY, { expiresIn: "15m" });
};

const generateRefreshToken = (admin) => {
  return jwt.sign({ id: admin._id, role: "admin" }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
};

// Admin login controller
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate Tokens
    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    // Store refresh token in an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/api/admin/refresh-token",
    });

    res.status(200).json({ message: "Admin login successful", accessToken });
  } catch (error) {
    console.error("Admin login error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Admin refresh token controller
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Unauthorized - No refresh token" });

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, admin) => {
      if (err) return res.status(403).json({ message: "Forbidden - Invalid refresh token" });

      const newAccessToken = generateAccessToken(admin);
      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin logout controller
export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", { path: "/api/admin/refresh-token" });
    res.status(200).json({ message: "Admin logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
