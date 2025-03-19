import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';
import winston from 'winston';

// Initialize dotenv to load environment variables
dotenv.config();

// Initialize the express app
const app = express();

// Winston logger setup
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }), // Log to console
    new winston.transports.File({ filename: 'app.log' }) // Log to file
  ]
});

// Morgan logger setup with Winston stream
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Middleware setup
app.use(cors()); // Enable Cross-Origin Requests (CORS)
app.use(helmet()); // Security middleware
app.use(express.json()); // Parse incoming JSON requests

// Basic server route to test the server
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Export the app for use in server.js
export default app;
