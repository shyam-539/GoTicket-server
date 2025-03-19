import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: [String], // Allows multiple genres
      required: true,
    },
    duration: {
      type: String, // Example: "2h 30m" or "150 min"
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number, // IMDb or custom rating (e.g., 1-10 scale)
      required: true,
      min: 0,
      max: 10,
    },
    director: {
      type: String,
      required: true,
      trim: true,
    },
    cast: {
      type: [String], // Array to store multiple actors
      required: true,
    },
    images: {
      banner: {
        type: String, // URL for the banner image
        required: true,
      },
      poster: {
        type: String, // URL for the poster image
        required: true,
      },
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "creatorRole", // Dynamic reference (TheaterOwner or Admin)
      required: true,
    },
    creatorRole: {
      type: String,
      enum: ["theaterOwner", "admin"], // Role of the creator
      required: true,
    },
  },
  { timestamps: true }
);

export const Movie = mongoose.model("Movie", movieSchema);
