import Razorpay from "razorpay";

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Store in .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Store in .env
});
