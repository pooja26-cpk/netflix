import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "default-avatar.png",
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
        position: { type: Number, default: 0 },
        isTV: { type: Boolean, default: false },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Profile", ProfileSchema);