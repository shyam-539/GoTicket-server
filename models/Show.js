import mongoose, { Schema } from "mongoose";

const showSchema = new Schema(
  {
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theaterId: {
      type: Schema.Types.ObjectId,
      ref: "TheaterOwner",
      required: true,
    },
    screen: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlots: [
      {
        time: { type: String, required: true },
        seats: [
          {
            seatType: {
              type: String,
              enum: ["Silver", "Gold", "Platinum"],
              required: true,
            },
            totalSeats: { type: Number, required: true },
            price: { type: Number, required: true },
            bookedSeats: [{ type: String }], // Store as string (e.g., "A1", "B3")
          },
        ],
      },
    ],
    totalSeats: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

export const Show = mongoose.model("Show", showSchema);
