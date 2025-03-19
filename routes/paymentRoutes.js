import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create an order with Razorpay
router.post("/create-order", createOrder);

// Verify payment from Razorpay
router.post("/verify-payment", verifyPayment);

export default router;
