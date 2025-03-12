import Theater from "../models/Theater.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/errorHandler.js";
import { validationResult } from "express-validator";

// Middleware for checking ownership
const checkTheaterOwnership = async (req, res, next) => {
  const { id } = req.params;
  try {
    const theater = await Theater.findById(id);
    if (!theater) {
      return next(new ApiError(`No theater found with id ${id}`, StatusCodes.NOT_FOUND));
    }
    if (theater.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new ApiError("You can only modify theaters you own", StatusCodes.UNAUTHORIZED));
    }
    req.theater = theater; // Attach theater data to request
    next();
  } catch (error) {
    next(error);
  }
};

// Create a theater
export const createTheater = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(errors.array().map(err => err.msg).join(", "), StatusCodes.BAD_REQUEST));
    }
    
    const theater = await Theater.create({ ...req.body, owner: req.user.id });
    res.status(StatusCodes.CREATED).json({ success: true, data: theater });
  } catch (error) {
    next(error);
  }
};

// Update theater
export const updateTheater = async (req, res, next) => {
  try {
    const { name, location, totalSeats, contact, status, amenities } = req.body;

    if (!req.theater) {
      return next(new ApiError("Theater not found", StatusCodes.NOT_FOUND));
    }

    let availableSeatsChange = 0;
    if (totalSeats && totalSeats !== req.theater.totalSeats) {
      availableSeatsChange = totalSeats - req.theater.totalSeats;
    }
    
    const updatedTheater = await Theater.findByIdAndUpdate(
      req.params.id,
      {
        name,
        location,
        totalSeats,
        availableSeats: req.theater.availableSeats + availableSeatsChange,
        contact,
        status,
        amenities,
      },
      { new: true, runValidators: true }
    );
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Theater updated successfully",
      data: updatedTheater,
    });
  } catch (error) {
    next(error);
  }
};

// Get all theaters
export const getAllTheaters = async (req, res, next) => {
  try {
    const theaters = await Theater.find().populate("owner", "name email").lean();
    res.status(StatusCodes.OK).json({ success: true, count: theaters.length, data: theaters });
  } catch (error) {
    next(error);
  }
};

// Get a single theater by ID
export const getTheaterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const theater = await Theater.findById(id)
      .populate("owner", "name email")
      .populate({ path: "shows.movie", select: "title genre duration rating" })
      .select("name location availableSeats totalSeats shows owner");
    
    if (!theater) {
      return next(new ApiError(`No theater found with id ${id}`, StatusCodes.NOT_FOUND));
    }
    
    res.status(StatusCodes.OK).json({ success: true, data: theater });
  } catch (error) {
    next(error);
  }
};

// Delete a theater
export const deleteTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findByIdAndDelete(req.params.id);
    if (!theater) {
      return next(new ApiError("Theater not found", StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({ success: true, message: "Theater deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get theaters owned by a specific user
export const getTheatersByOwner = async (req, res, next) => {
  try {
    if (req.user.role !== "theater-owner") {
      return next(new ApiError("Only theater owners can access their theaters", StatusCodes.UNAUTHORIZED));
    }
    
    const theaters = await Theater.find({ owner: req.user.id }).lean();
    res.status(StatusCodes.OK).json({ success: true, count: theaters.length, data: theaters });
  } catch (error) {
    next(error);
  }
};

export default {
  createTheater,
  updateTheater,
  getAllTheaters,
  getTheaterById,
  deleteTheater,
  getTheatersByOwner,
};
