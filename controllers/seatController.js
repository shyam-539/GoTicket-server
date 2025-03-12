import Seat from "../models/Seat.js";
import Screen from "../models/Screen.js";
import Theater from "../models/Theater.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/errorHandler.js";

import mongoose from "mongoose";

export const createSeats = async (req, res, next) => {
  const { screen: screenId, seats } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const screen = await Screen.findById(screenId).populate("theater").session(session);
    if (!screen) throw new ApiError(StatusCodes.NOT_FOUND, `No screen found with id ${screenId}`);

    if (screen.theater.owner.toString() !== req.user.id) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "You can only add seats to theaters you own");
    }

    const existingSeatsCount = await Seat.countDocuments({ screen: screenId }).session(session);
    if (existingSeatsCount + seats.length > screen.totalSeats) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Cannot add more than ${screen.totalSeats} seats`);
    }

    const seatSet = new Set();
    seats.forEach(({ row, number }) => {
      const key = `${row}-${number}`;
      if (seatSet.has(key)) throw new ApiError(StatusCodes.BAD_REQUEST, `Duplicate seat: Row ${row}, Number ${number}`);
      seatSet.add(key);
    });

    const existingSeats = await Seat.find({
      screen: screenId,
      $or: seats.map((s) => ({ row: s.row, number: s.number })),
    }).session(session);

    if (existingSeats.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Some seats already exist: ${existingSeats.map((s) => `Row ${s.row}, Number ${s.number}`).join(", ")}`);
    }

    await Seat.insertMany(seats.map((seat) => ({ ...seat, screen: screenId })), { session });

    await session.commitTransaction();
    session.endSession();
    res.status(StatusCodes.CREATED).json({ success: true, message: `${seats.length} seats created successfully` });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const getSeatsByScreen = async (req, res, next) => {
  try {
    const { screenId } = req.params;
    const screen = await Screen.findById(screenId).populate("theater");
    if (!screen) throw new ApiError(StatusCodes.NOT_FOUND, `No screen found with id ${screenId}`);

    const seats = await Seat.find({ screen: screenId }).sort({ row: 1, number: 1 });
    res.status(StatusCodes.OK).json({ success: true, count: seats.length, data: seats });
  } catch (error) {
    next(error);
  }
};

export const updateSeat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, isActive } = req.body;

    const seat = await Seat.findById(id).populate({ path: "screen", populate: { path: "theater" } });
    if (!seat) throw new ApiError(StatusCodes.NOT_FOUND, `No seat found with id ${id}`);

    if (seat.screen.theater.owner.toString() !== req.user.id && req.user.role !== "admin") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "You can only update seats in theaters you own");
    }

    seat.type = type || seat.type;
    seat.isActive = isActive !== undefined ? isActive : seat.isActive;
    await seat.save();

    res.status(StatusCodes.OK).json({ success: true, message: "Seat updated successfully", data: seat });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateSeats = async (req, res, next) => {
  const { screenId, updates } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const screen = await Screen.findById(screenId).populate("theater").session(session);
    if (!screen) throw new ApiError(StatusCodes.NOT_FOUND, `No screen found with id ${screenId}`);

    if (screen.theater.owner.toString() !== req.user.id && req.user.role !== "admin") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "You can only update seats in theaters you own");
    }

    const updateOperations = updates.map((update) => ({
      updateOne: {
        filter: update.id ? { _id: update.id, screen: screenId } : { row: update.row, number: update.number, screen: screenId },
        update: { $set: { type: update.type, isActive: update.isActive } },
      },
    }));

    const result = await Seat.bulkWrite(updateOperations, { session });
    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.OK).json({ success: true, message: `${result.modifiedCount} seats updated successfully` });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const deleteSeat = async (req, res, next) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const seat = await Seat.findById(id).populate({ path: "screen", populate: { path: "theater" } }).session(session);
    if (!seat) throw new ApiError(StatusCodes.NOT_FOUND, `No seat found with id ${id}`);

    if (seat.screen.theater.owner.toString() !== req.user.id && req.user.role !== "admin") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "You can only delete seats in theaters you own");
    }

    await Seat.deleteOne({ _id: id }).session(session);
    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.OK).json({ success: true, message: "Seat deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
