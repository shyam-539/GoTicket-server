import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const SeatSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: [true, "Seat must belong to a screen"],
    },
    row: {
      type: String,
      required: [true, "Row identifier is required"],
      trim: true,
    },
    number: {
      type: Number,
      required: [true, "Seat number is required"],
    },
    type: {
      type: String,
      enum: ["standard", "premium", "recliner", "wheelchair", "couple"],
      default: "standard",
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Create compound index for unique seat in a screen
SeatSchema.index({ screen: 1, row: 1, number: 1 }, { unique: true });

export default mongoose.model("Seat", SeatSchema);