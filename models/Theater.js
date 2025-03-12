import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const TheaterSchema = new mongoose.Schema(
  {
    theaterId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    name: {
      type: String,
      required: [true, "Theater name is required"],
      trim: true,
      minlength: [2, "Theater name must be at least 2 characters long"],
      maxlength: [100, "Theater name cannot exceed 100 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Theater must have an owner"],
    },
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
      },
      coordinates: {
        lat: {
          type: Number,
          default: null,
        },
        lng: {
          type: Number,
          default: null,
        },
      },
    },
    contact: {
      email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "under maintenance"],
      default: "active",
    },
    amenities: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imageId: {
      type: String,
      default: "",
    },
    // Approval system
    isApproved: {
      type: Boolean,
      default: false, // Needs admin approval before activation
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

export default mongoose.model("Theater", TheaterSchema);
