import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import TokenBlacklist from "../models/TokenBlacklist.js";
import cloudinary from "../config/cloudinary.js";
import logger from "../utils/logger.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";
import { ApiError } from "../utils/errorHandler.js";

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError("Email already in use", 409);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      userId: uuidv4(),
    });

    await user.save();

    logger.info(`New user registered: ${email}`);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { userId: user.userId, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Update login attempts
      user.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.accountLocked = true;
        user.lockUntil = Date.now() + 3600000; // Lock for 1 hour
        await user.save();
        throw new ApiError(
          "Account locked due to too many failed attempts. Try again in 1 hour.",
          403
        );
      }

      await user.save();
      throw new ApiError("Invalid credentials", 401);
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.accountLocked = false;
      user.lockUntil = null;
      await user.save();
    }

    // Check if account is locked
    if (user.accountLocked && user.lockUntil > Date.now()) {
      throw new ApiError("Account is locked. Try again later.", 403);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save();

    // Update last login timestamp
    await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

    logger.info(`User logged in: ${email}`);

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePic: user.profilePic,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new ApiError("Refresh token required", 401);
    }

    // Verify the token is not blacklisted
    const isBlacklisted = await TokenBlacklist.findOne({ token: refreshToken });
    if (isBlacklisted) {
      throw new ApiError("Invalid refresh token", 401);
    }

    // Verify the token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find the user
    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user) {
      throw new ApiError("Invalid refresh token", 401);
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token in cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Add refresh token to blacklist
      await TokenBlacklist.create({
        token: refreshToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Remove refresh token from user document
      await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    }

    res.clearCookie("refreshToken");

    logger.info(`User logged out: ${req.user.id}`);
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken -loginAttempts -accountLocked -lockUntil"
    );
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // If email is being updated, check it's not already in use
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.id },
      });
      if (existingUser) {
        throw new ApiError("Email already in use", 409);
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    }).select(
      "-password -refreshToken -loginAttempts -accountLocked -lockUntil"
    );

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    logger.info(`User profile updated: ${req.user.id}`);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePic = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError("No file uploaded", 400);
    }

    // Validate file mime type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new ApiError(
        "Invalid file type. Only JPEG, JPG and PNG files are allowed",
        400
      );
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_pictures",
      transformation: [{ width: 500, height: 500, crop: "fill" }],
    });

    // Get current user profile pic public_id if exists
    const user = await User.findById(req.user.id);
    const currentPicId = user.profilePicId;

    // Update user profile with new image URL and public_id
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        profilePic: result.secure_url,
        profilePicId: result.public_id,
      },
      { new: true }
    ).select(
      "-password -refreshToken -loginAttempts -accountLocked -lockUntil"
    );

    // Delete old profile picture if it exists
    if (currentPicId) {
      await cloudinary.uploader.destroy(currentPicId);
    }

    logger.info(`User profile picture updated: ${req.user.id}`);
    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ApiError("Current password is incorrect", 401);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and password history
    user.passwordHistory.push(user.password);
    if (user.passwordHistory.length > 5) {
      user.passwordHistory.shift(); // Keep only last 5 passwords
    }
    user.password = hashedPassword;
    user.passwordChangedAt = Date.now();

    await user.save();

    logger.info(`User password changed: ${req.user.id}`);
    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Delete profile picture from Cloudinary if exists
    if (user.profilePicId) {
      await cloudinary.uploader.destroy(user.profilePicId);
    }

    // Delete user account
    await User.findByIdAndDelete(req.user.id);

    logger.info(`User account deleted: ${req.user.id}`);
    res.clearCookie("refreshToken");
    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
