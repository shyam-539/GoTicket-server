import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import compression from "compression";
import { errors } from "celebrate";
import { errorHandler } from "./utils/errorHandler.js";
import logger from "./utils/logger.js";

// Importing Routes
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import theaterRoutes from "./routes/theaterRoutes.js";
import screenRoutes from "./routes/screenRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import seatRoutes from "./routes/seatRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";

const app = express();

// Middleware
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Adding Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/v1/theater", theaterRoutes);
app.use("/api/v1/screen", screenRoutes);
app.use("/api/v1/show", showRoutes);
app.use("/api/v1/seat", seatRoutes);
app.use("/api/v1/movie", movieRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// Global error handler for celebrate validation errors
app.use(errors());

// Global error handler
app.use(errorHandler);

export default app;
