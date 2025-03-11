import mongoose from "mongoose";

const TheaterSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Theater name is required"],
      trim: true,
    },
    address: {
      buildingNumber: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats are required"],
      min: 1,
    },
    contactEmail: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    contactPhone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    shows: [
      {
        movie: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Movie",
        },
        showTime: {
          type: Date,
          required: true,
          validate: {
            validator: function (value) {
              return value > new Date();
            },
            message: "Showtime must be in the future",
          },
        },
        bookedSeats: {
          type: [String], // Example: ["A1", "A2", "B3"]
          default: [],
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Enable virtual fields
    toObject: { virtuals: true },
  }
);

// ✅ Auto-calculate `availableSeats`
TheaterSchema.virtual("availableSeats").get(function () {
  let bookedSeatsCount = this.shows.reduce((acc, show) => acc + show.bookedSeats.length, 0);
  return this.totalSeats - bookedSeatsCount;
});

export default mongoose.model("Theater", TheaterSchema);
