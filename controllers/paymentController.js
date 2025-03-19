import crypto from "crypto"; // Import crypto for signature verification
import { Booking } from "../models/Bookings.js"; // Import Booking model
import { razorpayInstance } from "../utils/razorPay.js"; // Import Razorpay instance

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", bookingId } = req.body; // Extract payment details

    if (!amount || !bookingId) {
      return res.status(400).json({ message: "Amount & Booking ID required" }); // Validate input
    }

    const options = {
      amount: amount * 100, // Convert to paisa (₹100 -> 10000)
      currency,
      receipt: `receipt_${bookingId}`, // Unique receipt ID
    };

    const order = await razorpayInstance.orders.create(options); // Create order in Razorpay

    res.status(201).json({ success: true, order }); // Return order details
  } catch (error) {
    res.status(500).json({ message: "Error creating payment order" }); // Handle errors
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body; // Extract payment details

    const body = razorpay_order_id + "|" + razorpay_payment_id; // Concatenate order and payment ID
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex"); // Generate expected signature

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" }); // Validate signature
    }

    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "Paid" }); // Update booking status

    res.status(200).json({ message: "Payment verified successfully!" }); // Return success response
  } catch (error) {
    console.error("Payment verification error:", error); // Log error
    res.status(500).json({ message: "Payment verification failed" }); // Handle errors
  }
};
