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

// Admin profile controller
export const adminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ data: admin });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ data: users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get user by ID
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Path: controllers/theaterOwnerController.js
export const getAllTheater = async (req, res) => {
  try {
    // Fetch all theater owners from the database
    const theaters = await TheaterOwner.find().select("-password");

    // Check if theaters exist
    if (!theaters || theaters.length === 0) {
      return res.status(404).json({ message: "No theaters found" });
    }
    // Send response
    res
      .status(200)
      .json({ message: "Theaters fetched successfully", data: theaters });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get theater by ID
export const deleteTheater = async (req, res) => {
  try {
    await TheaterOwner.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Theater deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};






// Path: controllers/adminController.js

export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ isRead: false })
      .populate("ownerId", "name email phone location isVerified") // Include owner details
      .sort({ createdAt: -1 }) // Show newest first
      .lean(); // Optimize performance

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching admin notifications:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Mark notification as read and verify theater owner
export const markNotificationAsReadAndVerify = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const { isVerified } = req.body; // Admin sends true (verify) or false (reject)

    // Ensure isVerified is a boolean (true or false)
    if (typeof isVerified !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification status" });
    }

    // Find the notification
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    // Find the corresponding theater owner
    const theaterOwner = await TheaterOwner.findById(notification.ownerId);
    if (!theaterOwner) {
      return res
        .status(404)
        .json({ success: false, message: "Theater owner not found" });
    }

    // Update verification status
    theaterOwner.isVerified = isVerified;
    await theaterOwner.save();

    // Mark notification as read
    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: `Theater owner ${
        isVerified ? "verified" : "rejected"
      } successfully`,
      isVerified,
    });
  } catch (error) {
    console.error("Error verifying theater owner:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
