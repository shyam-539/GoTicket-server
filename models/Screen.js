import mongoose from "mongoose";

const ScreenSchema = new mongoose.Schema(
  {
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },
    screenNumber: {
      type: Number,
      required: true,
    },
    seatLayout: {
      rows: { type: Number, required: true },
      cols: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Screen", ScreenSchema);
