import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import generateProfilePic from "../utils/profilePicGenerator.js";

const seatSchema = new Schema({
  seatId: { type: Schema.Types.ObjectId, auto: true },
  seatLabel: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});

const rowSchema = new Schema({
  rowLabel: { type: String, required: true },
  seats: [seatSchema],
});

const seatTypeSchema = new Schema({
  seatType: { type: String, enum: ["Silver", "Gold", "Platinum"], required: true },
  totalSeats: { type: Number, required: true },
  price: { type: Number, required: true },
  rows: [rowSchema],
});

const theaterOwnerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    seatConfiguration: [seatTypeSchema],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    role: { type: String, default: "theaterOwner" },
    profilePic: { type: String },
  },
  { timestamps: true }
);

// Indexes for better performance
theaterOwnerSchema.index({ email: 1 });
theaterOwnerSchema.index({ location: 1 });

// Middleware for password hashing & profile pic generation
theaterOwnerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.profilePic) {
    this.profilePic = generateProfilePic(this.name);
  }
  next();
});

export const TheaterOwner = model("TheaterOwner", theaterOwnerSchema);
