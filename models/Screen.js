import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ScreenSchema = new mongoose.Schema(
  {
    screenId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: [true, "Screen must belong to a theater"],
    },
    name: {
      type: String,
      required: [true, "Screen name is required"],
      trim: true,
    },
    screenNumber: {
      type: Number,
      required: [true, "Screen number is required"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: [1, "A screen must have at least 1 seat"],
    },
    seatingArrangement: {
      rows: {
        type: Number,
        required: [true, "Number of rows is required"],
      },
      columns: {
        type: Number,
        required: [true, "Number of columns is required"],
      },
    },
    screenType: {
      type: String,
      enum: ["standard", "premium", "imax", "3d", "vip"],
      default: "standard",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "under maintenance"],
      default: "active",
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

// Prevent duplicate screen numbers in the same theater
ScreenSchema.index({ theater: 1, screenNumber: 1 }, { unique: true });

export default mongoose.model("Screen", ScreenSchema);