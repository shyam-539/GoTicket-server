import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ShowSchema = new mongoose.Schema(
  {
    showId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: [true, "Show must belong to a theater"],
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: [true, "Show must be assigned to a screen"],
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Show must be linked to a movie"],
    },
    date: {
      type: Date,
      required: [true, "Show date is required"],
    },
    startTime: {
      type: Date,
      required: [true, "Show start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "Show end time is required"],
    },
    price: {
      standard: {
        type: Number,
        required: [true, "Standard ticket price is required"],
        min: [0, "Price cannot be negative"],
      },
      premium: {
        type: Number,
        default: 0,
        min: [0, "Price cannot be negative"],
      },
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    language: {
      type: String,
      required: [true, "Show language is required"],
    },
    format: {
      type: String,
      enum: ["2D", "3D", "IMAX", "4DX", "IMAX 3D"],
      default: "2D",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Prevent scheduling conflicts on the same screen
ShowSchema.index({ screen: 1, startTime: 1 }, { unique: true });
ShowSchema.index({ screen: 1, endTime: 1 }, { unique: true });

export default mongoose.model("Show", ShowSchema);