import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["booking", "payment", "theaterUpdate", "system"], // Restrict to known types
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TheaterOwner",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Auto-adds createdAt & updatedAt fields
);

export const Notification = mongoose.model("Notification", notificationSchema);
