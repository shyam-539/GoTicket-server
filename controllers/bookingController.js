import { qrCodeGenerator } from "../utils/qrCodeGenerator.js"; // QR code generator utility
import { Booking } from "../models/Bookings.js";
import { Show } from "../models/Show.js";
import { TheaterOwner } from "../models/Theater.js";
import { User } from "../models/User.js";

export const bookShow = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from authentication middleware
    const { showId, theaterId, selectedSeats, seatType } = req.body; // Extract booking details

    if (!showId || !theaterId || !selectedSeats || !seatType || selectedSeats.length === 0) {
      return res.status(400).json({ error: "Invalid booking details" }); // Validate input
    }

    const show = await Show.findById(req.body.showId); // Find the show
    if (!show) return res.status(404).json({ message: "Show not found" });

    const theater = await TheaterOwner.findById(req.body.theaterId); // Find the theater
    if (!theater) return res.status(404).json({ message: "Theater not found" });

    let isAnySeatBooked = false; // Check if selected seats are already booked
    theater.seatConfiguration.forEach((seatCategory) => {
      if (seatCategory.seatType.toLowerCase() === seatType.toLowerCase()) {
        seatCategory.rows.forEach((row) => {
          row.seats.forEach((seat) => {
            if (selectedSeats.includes(seat.seatLabel) && seat.isBooked) isAnySeatBooked = true;
          });
        });
      }
    });
    if (isAnySeatBooked) return res.status(400).json({ message: "Selected seats are already booked" });

    const allSeats = theater.seatConfiguration.flatMap((seatType) =>
      seatType.rows.flatMap((row) =>
        row.seats.map((col) => ({
          seatLabel: `${col.seatLabel}`, // Seat label like "H1"
          price: seatType.price, // Seat price
          isBooked: col.isBooked === true, // Check if booked
          seatType: seatType.seatType,
        }))
      )
    );

    const filteredSeats = allSeats.filter(
      (seat) => seat.seatType.toLowerCase() === req.body.seatType.toLowerCase()
    ); // Filter seats by type

    console.log("Filtered seat", filteredSeats);

    const selectedSeatDetails = filteredSeats.filter((seat) =>
      req.body.selectedSeats.includes(seat.seatLabel)
    ); // Get selected seat details

    if (selectedSeatDetails.length !== req.body.selectedSeats.length) {
      return res.status(400).json({ message: "Some seats are invalid or unavailable" });
    } // Ensure valid seat details

    const totalPrice = selectedSeatDetails.reduce((acc, seat) => acc + seat.price, 0); // Calculate total price

    const newBooking = new Booking({
      user: userId, // User making the booking
      show: showId, // Show being booked
      theater: theaterId, // Theater ID
      seats: selectedSeatDetails, // Seat details
      totalAmount: totalPrice, // Total price
      paymentStatus: "Pending", // Payment status
    });

    newBooking.qrCode = await qrCodeGenerator(newBooking._id.toString()); // Generate QR code for booking
    await newBooking.save(); // Save booking to database

    theater.seatConfiguration.forEach((seatCategory) => {
      if (seatCategory.seatType.toLowerCase() === seatType.toLowerCase()) {
        seatCategory.rows.forEach((row) => {
          row.seats.forEach((seat) => {
            if (selectedSeats.includes(seat.seatLabel)) seat.isBooked = true;
          });
        });
      }
    }); // Mark seats as booked in theater schema

    await theater.save(); // Save updated theater document

    res.status(201).json({ message: "Booking successful!", booking: newBooking }); // Return success response
  } catch (error) {
    res.status(500).json({ error: "Internal server error" }); // Handle server errors
  }
};
