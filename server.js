import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

// Load environment variables and check for errors
const result = dotenv.config();
if (result.error) {
  console.error("❌ Error loading .env file:", result.error);
  process.exit(1);
}

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Server setup failed:", error.message);
    process.exit(1);
  }
};

startServer();
