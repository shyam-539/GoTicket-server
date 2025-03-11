import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid"; // Import UUID for generating unique IDs

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      default: () => uuidv4(), // Generates an id automatically
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    passwordHistory: {
      type: [String],
      default: [],
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ["user", "theater-owner", "admin"],
      default: "user",
      lowercase: true, // Converts input to lowercase
    },
    profilePic: {
      type: String,
      default: "",
    },
    profilePicId: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      default: null,
    },
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    accountLocked: {
      type: Boolean,
      default: false,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        
        if (!options.showSensitive) {
          delete ret.password;
          delete ret.refreshToken;
          delete ret.loginAttempts;
          delete ret.accountLocked;
          delete ret.lockUntil;
          delete ret.passwordHistory;
        }
        
        return ret;
      },
    },
  }
);

// Pre-save hook for validation
UserSchema.pre("save", function (next) {
  // Skip this if password isn't modified
  if (!this.isModified("password")) {
    return next();
  }

  // Check if new password is in password history
  if (this.passwordHistory && this.passwordHistory.length > 0) {
    const passwordHistoryPromises = this.passwordHistory.map((oldPassword) =>
      bcrypt.compare(this.password, oldPassword)
    );

    Promise.all(passwordHistoryPromises)
      .then((results) => {
        if (results.includes(true)) {
          return next(
            new Error(
              "Password has been used before. Please choose a different password."
            )
          );
        }
        next();
      })
      .catch((err) => next(err));
  } else {
    next();
  }
});

export default mongoose.model("User", UserSchema);
