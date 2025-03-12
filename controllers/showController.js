import Show from "../models/Show.js";
import Screen from "../models/Screen.js";
import Theater from "../models/Theater.js";
import Movie from "../models/Movie.js";
import SeatAvailability from "../models/SeatAvailability.js";
import Seat from "../models/Seat.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, UnauthorizedError, BadRequestError } from "../utils/errorHandler.js";
import mongoose from "mongoose";

// ✅ Create a Show
export const createShow = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { theater: theaterId, screen: screenId, movie: movieId, date, startTime, endTime, price, language, format } = req.body;
    
    // Verify Theater
    const theater = await Theater.findById(theaterId).session(session);
    if (!theater) throw new NotFoundError(`No theater found with id ${theaterId}`);
    if (theater.owner.toString() !== req.user.id) throw new UnauthorizedError("You can only add shows to theaters you own");

    // Verify Screen
    const screen = await Screen.findOne({ _id: screenId, theater: theaterId }).session(session);
    if (!screen) throw new NotFoundError(`No screen found with id ${screenId} in this theater`);

    // Verify Movie
    const movie = await Movie.findById(movieId).session(session);
    if (!movie) throw new NotFoundError(`No movie found with id ${movieId}`);

    // Convert string dates to Date objects
    const showDate = new Date(date).toISOString();
    const showStartTime = new Date(startTime).toISOString();
    const showEndTime = new Date(endTime).toISOString();

    if (showEndTime <= showStartTime) throw new BadRequestError("End time must be after start time");

    // Check for conflicts using $expr for better performance
    const conflictingShow = await Show.findOne({
      screen: screenId,
      $expr: {
        $and: [
          { $lte: ["$startTime", showStartTime] },
          { $gte: ["$endTime", showStartTime] }
        ]
      }
    }).session(session);

    if (conflictingShow) throw new BadRequestError("There is a scheduling conflict with another show on this screen");

    // Create the Show
    const show = await Show.create([{ theater: theaterId, screen: screenId, movie: movieId, date: showDate, startTime: showStartTime, endTime: showEndTime, price, availableSeats: screen.totalSeats, language, format }], { session });
    
    // Bulk Insert Seat Availability
    const seats = await Seat.find({ screen: screenId }).session(session);
    const seatAvailabilities = seats.map(seat => ({
      show: show[0]._id,
      seat: seat._id,
      status: "available",
      price: seat.type === "premium" ? price.premium : price.standard
    }));
    await SeatAvailability.insertMany(seatAvailabilities, { session });
    
    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.CREATED).json({ success: true, message: "Show created successfully", data: show[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating show:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

// Get all Shows
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find().populate("movie").populate("theater").populate("screen");
    res.status(StatusCodes.OK).json({ success: true, data: shows });
  } catch (error) {
    console.error("Error fetching shows:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

// Get Show by ID
export const getShowById = async (req, res) => {
  try {
    const { id } = req.params;
    const show = await Show.findById(id).populate("movie").populate("theater").populate("screen");
    if (!show) throw new NotFoundError(`No show found with id ${id}`);

    res.status(StatusCodes.OK).json({ success: true, data: show });
  } catch (error) {
    console.error("Error fetching show:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

// Update Show
export const updateShow = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedShow = await Show.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedShow) throw new NotFoundError(`No show found with id ${id}`);

    res.status(StatusCodes.OK).json({ success: true, message: "Show updated successfully", data: updatedShow });
  } catch (error) {
    console.error("Error updating show:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

// Delete Show (Added this function)
export const deleteShow = async (req, res) => {
  try {
    const { id } = req.params;
    
    const show = await Show.findById(id);
    if (!show) throw new NotFoundError(`No show found with id ${id}`);

    await Show.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({ success: true, message: "Show deleted successfully" });
  } catch (error) {
    console.error("Error deleting show:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

// Get all Shows for a Specific Theater
export const getShowsByTheater = async (req, res) => {
  try {
    const { theaterId } = req.params;
    
    // Check if the theater exists
    const theaterExists = await Theater.findById(theaterId);
    if (!theaterExists) throw new NotFoundError(`No theater found with id ${theaterId}`);

    // Fetch shows for the specified theater
    const shows = await Show.find({ theater: theaterId })
      .populate("movie")
      .populate("screen");

    res.status(StatusCodes.OK).json({ success: true, data: shows });
  } catch (error) {
    console.error("Error fetching shows for theater:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};
