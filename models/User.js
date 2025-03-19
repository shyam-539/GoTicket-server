import mongoose, { Schema } from "mongoose";
import generateProfilePic from "../utils/profilePicGenerator.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 30,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxLength: 50,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate phone numbers
      trim: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      select: false, // Prevents password from being returned in queries
    },
    role: {
      type: String,
      required: true,
      enum: ["user"],
      default: "user",
      immutable: true, // Prevents role modification
    },
    profilePic: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate profile picture before saving
userSchema.pre("save", function (next) {
  if (!this.profilePic) {
    this.profilePic = generateProfilePic(this.name);
  }
  next();
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const bcrypt = await import("bcrypt");
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const User = mongoose.model("User", userSchema);
