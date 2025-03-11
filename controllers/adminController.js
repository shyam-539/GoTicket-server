import User from "../models/User.js";
import Theater from "../models/Theater.js";
import { ApiError } from "../utils/errorHandler.js";

// Get all users (Admins only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// Delete user (Admins only)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new ApiError("User not found", 404);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get all theaters (Admins only)
export const getAllTheaters = async (req, res, next) => {
  try {
    const theaters = await Theater.find();
    res.status(200).json({ success: true, theaters });
  } catch (error) {
    next(error);
  }
};

// Delete theater (Admins only)
export const deleteTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findByIdAndDelete(req.params.id);
    if (!theater) throw new ApiError("Theater not found", 404);
    res.status(200).json({ success: true, message: "Theater deleted successfully" });
  } catch (error) {
    next(error);
  }
};
