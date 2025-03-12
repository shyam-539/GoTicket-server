import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const MovieSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      unique: true,
      default: uuidv4,
    },
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Movie description is required"],
    },
    duration: {
      type: Number, // in minutes
      required: [true, "Movie duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
    },
    language: {
      type: [String],
      required: true,
    },
    genre: {
      type: [String],
      required: true,
    },
    cast: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      trim: true,
      default: "",
    },
    certificate: {
      type: String,
      enum: ["U", "UA", "A", "S"], // Indian certification system
      default: "UA",
    },
    poster: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    banner: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    trailerUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["now-showing", "coming-soon", "archived"],
      default: "now-showing",
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    // New Fields
    theaterOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // Movies require admin approval
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export default mongoose.model("Movie", MovieSchema);
