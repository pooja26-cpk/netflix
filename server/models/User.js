import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    watchlist: [{
      movieId: { type: Number, required: true },
      title: { type: String, required: true },
      poster_path: String,
      isTV: { type: Boolean, default: false },
      addedAt: { type: Date, default: Date.now }
    }],
    favorites: [{
      movieId: { type: Number, required: true },
      title: { type: String, required: true },
      poster_path: String,
      isTV: { type: Boolean, default: false },
      addedAt: { type: Date, default: Date.now }
    }],
    watchHistory: [
      {
        movieId: { type: Number, required: true },
        position: { type: Number, default: 0 }, // Position in seconds
        isTV: { type: Boolean, default: false },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    favorites: [{
      movieId: { type: Number, required: true },
      title: { type: String, required: true },
      poster_path: String,
      isTV: { type: Boolean, default: false },
      addedAt: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

// Index for faster queries (email index created automatically by unique constraint)

export default mongoose.model("User", userSchema);