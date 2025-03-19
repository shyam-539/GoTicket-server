import { Booking } from "../models/Bookings.js";
import { Movie } from "../models/Movies.js";
import { Show } from "../models/Show.js";
import { TheaterOwner } from "../models/Theater.js";
import mongoose from "mongoose";

/*==========
  CREATE SHOW
=========== */
export const addShow = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { movieId, screen, date, timeSlots } = req.body;

    if (!movieId || !screen || !date || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found." });
    }

    if (req.user.role !== "theaterOwner") {
      return res.status(403).json({ success: false, message: "Only theater owners can add shows." });
    }

    const theaterOwner = await TheaterOwner.findById(req.user._id);
    if (!theaterOwner || !theaterOwner.seatConfiguration?.length) {
      return res.status(400).json({ success: false, message: "Theater must have a seat configuration." });
    }

    // Format timeSlots with seat details
    const formattedTimeSlots = timeSlots.map((slot) => ({
      time: slot,
      seats: theaterOwner.seatConfiguration.map((seat) => ({
        seatType: seat.seatType,
        totalSeats: seat.totalSeats,
        price: seat.price,
        bookedSeats: [],
      })),
    }));

    const totalSeats = theaterOwner.seatConfiguration.reduce((acc, seat) => acc + seat.totalSeats, 0);

    const newShow = new Show({
      movieId,
      theaterId: req.user._id,
      screen,
      date,
      timeSlots: formattedTimeSlots,
      totalSeats,
      status: "Scheduled",
    });

    await newShow.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, message: "Show added successfully!", show: newShow });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

/*==========
  EDIT SHOW
=========== */
export const editShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const { screen, date, timeSlots } = req.body;

    if (!showId || !screen || !date || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ success: false, message: "Invalid date format." });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: "Show not found." });
    }

    if (req.user._id.toString() !== show.theaterId.toString()) {
      return res.status(403).json({ success: false, message: "You can only edit your own shows." });
    }

    const existingShow = await Show.findOne({
      theaterId: req.user._id,
      screen,
      date,
      "timeSlots.time": { $in: timeSlots },
      _id: { $ne: showId },
    });

    if (existingShow) {
      return res.status(400).json({ success: false, message: "A show already exists at the selected time." });
    }

    const theaterOwner = await TheaterOwner.findById(req.user._id);
    if (!theaterOwner || !theaterOwner.seatConfiguration?.length) {
      return res.status(400).json({ success: false, message: "Theater must have a seat configuration." });
    }

    show.screen = screen;
    show.date = date;
    show.timeSlots = timeSlots.map((slot) => ({
      time: slot,
      seats: theaterOwner.seatConfiguration.map((seat) => ({
        seatType: seat.seatType,
        totalSeats: seat.totalSeats,
        price: seat.price,
        bookedSeats: [],
      })),
    }));

    await show.save();
    res.status(200).json({ success: true, message: "Show updated successfully!", show });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

/*==========
  DELETE SHOW
=========== */
export const deleteShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    if (show.theaterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not the creator of this show." });
    }

    const existingBookings = await Booking.findOne({ showId: req.params.id });
    if (existingBookings) {
      return res.status(400).json({ success: false, message: "Cannot delete a show with existing bookings." });
    }

    await Show.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Show deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};
