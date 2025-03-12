import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },
    showDetails: {
      date: {
        type: Date,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
      screen: {
        type: Number,
        required: true,
      },
    },
    seats: {
      type: [String],
      required: true,
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: "At least one seat must be selected"
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "upi", "net_banking", "wallet"],
      required: true,
    },
    paymentId: String,
    bookingStatus: {
      type: String,
      enum: ["confirmed", "cancelled", "expired"],
      default: "confirmed",
    },
    qrCode: String,
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: String,
    refundDate: Date,
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

export default mongoose.model("Booking", BookingSchema);