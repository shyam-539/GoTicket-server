import Screen from "../models/Screen.js";
import Theater from "../models/Theater.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/errorHandler.js";

export const createScreen = async (req, res, next) => {
  try {
    const { theater: theaterId, name, screenNumber, totalSeats, seatingArrangement, screenType } = req.body;
    
    const theater = await Theater.findById(theaterId);
    if (!theater) throw new ApiError(`No theater found with id ${theaterId}`, StatusCodes.NOT_FOUND);
    if (theater.owner.toString() !== req.user.id) throw new ApiError("You can only add screens to theaters you own", StatusCodes.UNAUTHORIZED);
    
    const existingScreen = await Screen.findOne({ theater: theaterId, screenNumber });
    if (existingScreen) throw new ApiError(`Screen number ${screenNumber} already exists in this theater`, StatusCodes.BAD_REQUEST);
    
    const screen = await Screen.create({ theater: theaterId, name, screenNumber, totalSeats, seatingArrangement, screenType });
    res.status(StatusCodes.CREATED).json({ success: true, message: "Screen created successfully", data: screen });
  } catch (error) {
    next(error);
  }
};

export const getScreensByTheater = async (req, res, next) => {
  try {
    const { theaterId } = req.params;
    const theater = await Theater.findById(theaterId);
    if (!theater) throw new ApiError(`No theater found with id ${theaterId}`, StatusCodes.NOT_FOUND);
    if (theater.owner.toString() !== req.user.id && req.user.role !== "admin") throw new ApiError("Unauthorized access", StatusCodes.UNAUTHORIZED);
    
    const screens = await Screen.find({ theater: theaterId });
    res.status(StatusCodes.OK).json({ success: true, count: screens.length, data: screens });
  } catch (error) {
    next(error);
  }
};

export const getScreenById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const screen = await Screen.findById(id).populate("theater");
    if (!screen) throw new ApiError(`No screen found with id ${id}`, StatusCodes.NOT_FOUND);
    if (screen.theater.owner.toString() !== req.user.id && req.user.role !== "admin") throw new ApiError("Unauthorized access", StatusCodes.UNAUTHORIZED);
    
    res.status(StatusCodes.OK).json({ success: true, data: screen });
  } catch (error) {
    next(error);
  }
};

export const updateScreen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, screenNumber, totalSeats, seatingArrangement, screenType, status } = req.body;
    
    const screen = await Screen.findById(id).populate("theater");
    if (!screen) throw new ApiError(`No screen found with id ${id}`, StatusCodes.NOT_FOUND);
    if (screen.theater.owner.toString() !== req.user.id && req.user.role !== "admin") throw new ApiError("Unauthorized update", StatusCodes.UNAUTHORIZED);
    
    if (screenNumber && screenNumber !== screen.screenNumber) {
      const existingScreen = await Screen.findOne({ theater: screen.theater._id, screenNumber, _id: { $ne: id } });
      if (existingScreen) throw new ApiError(`Screen number ${screenNumber} already exists in this theater`, StatusCodes.BAD_REQUEST);
    }
    
    const updatedScreen = await Screen.findByIdAndUpdate(
      id,
      { name, screenNumber, totalSeats, seatingArrangement, screenType, status },
      { new: true, runValidators: true }
    );
    
    res.status(StatusCodes.OK).json({ success: true, message: "Screen updated successfully", data: updatedScreen });
  } catch (error) {
    next(error);
  }
};

export const deleteScreen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const screen = await Screen.findById(id).populate("theater");
    if (!screen) throw new ApiError(`No screen found with id ${id}`, StatusCodes.NOT_FOUND);
    if (screen.theater.owner.toString() !== req.user.id && req.user.role !== "admin") throw new ApiError("Unauthorized delete", StatusCodes.UNAUTHORIZED);
    
    await Screen.findByIdAndDelete(id);
    res.status(StatusCodes.OK).json({ success: true, message: "Screen deleted successfully" });
  } catch (error) {
    next(error);
  }
};