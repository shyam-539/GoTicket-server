import { User } from "../models/User.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import generateProfilePic from "../utils/profilePicGenerator.js";
import sendEmail from "../utils/sendEmail.js";

// User signup
export const userSignup = async (req, res) => {
  try {
    const { name, email, phone, password, profilePic } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePicUrl = profilePic || generateProfilePic(name);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      profilePic: profilePicUrl,
      role: "user",
    });

    await newUser.save();
    const token = generateToken(newUser._id, newUser.role);
    res.cookie("token", token, { httpOnly: true, secure: true });

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json({ data: userWithoutPassword, message: "Signup successful" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// User login
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const passwordMatch = await bcrypt.compare(password, userExist.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!userExist.isActive) {
      return res.status(400).json({ message: "Account is inactive" });
    }

    const token = generateToken(userExist._id, userExist.role);
    res.cookie("token", token, { httpOnly: true, secure: true });

    const userWithoutPassword = userExist.toObject();
    delete userWithoutPassword.password;

    res.status(302).json({ data: userWithoutPassword, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// User logout
export const userLogout = async (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: true });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Fetch user profile
export const userProfile = async (req, res) => {
  try {
    res.status(200).json({ data: req.user, message: "Profile fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Edit user profile
export const profileEdit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, profilePic } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, profilePic },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ data: updatedUser, message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Deactivate user account
export const userDeactivate = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({ message: "Account deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Change user password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPassword = crypto.randomBytes(4).toString("hex");
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const subject = "Password Reset Successful";
    const message = `Your new password is: ${newPassword}. Please log in and change your password immediately.`;

    await sendEmail(user.email, subject, message);
    res.status(200).json({ message: "New password sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
