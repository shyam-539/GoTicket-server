import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';

const adminSchema = new Schema(
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
      lowercase: true,
      trim: true,
      index: true, // Optimize queries by email
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    role: {
      type: String,
      required: true,
      default: "admin",
      immutable: true, // Prevents modification of the role
    },
    profilePic: {
      type: String,
      default:
        "https://t4.ftcdn.net/jpg/02/27/45/09/360_F_227450952_KQCMShHPOPebUXklULsKsROk5AvN6H1H.jpg",
      match: [/^https?:\/\/[^\s]+$/, "Please provide a valid URL for the profile picture."]
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

// Hash password before saving the admin user
adminSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Prevent modifications to the role after creation
adminSchema.pre("save", function (next) {
  if (this.role !== "admin") {
    this.role = "admin"; // Force role to stay as admin
  }
  next();
});

export const Admin = mongoose.model("Admin", adminSchema);
