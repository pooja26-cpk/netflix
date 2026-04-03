import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    movie: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Add unique compound index to prevent duplicate reviews for same movie by same user
ReviewSchema.index({ movie: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", ReviewSchema);