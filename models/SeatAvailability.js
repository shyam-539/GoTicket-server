import mongoose from "mongoose";

const SeatAvailabilitySchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: [true, "Seat availability must be linked to a show"],
    },
    seat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
      required: [true, "Seat availability must be linked to a seat"],
    },
    status: {
      type: String,
      enum: ["available", "booked", "reserved", "maintenance"],
      default: "available",
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    price: {
      type: Number,
      required: [true, "Seat price is required"],
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

// Each seat can have only one availability status per show
SeatAvailabilitySchema.index({ show: 1, seat: 1 }, { unique: true });

export default mongoose.model("SeatAvailability", SeatAvailabilitySchema);