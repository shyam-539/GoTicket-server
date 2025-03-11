import mongoose from "mongoose";

const TokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expires: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatically delete document when expires
    },
  },
  { timestamps: true }
);

export default mongoose.model("TokenBlacklist", TokenBlacklistSchema);
