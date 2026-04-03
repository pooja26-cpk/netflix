import express from "express";
import Profile from "../models/Profile.js";
import authenticate from "../verifyToken.js";

const router = express.Router();

// Get all profiles for the authenticated user
router.get("/", authenticate, async (req, res) => {
  try {
    const profiles = await Profile.find({ user: req.user.id });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profiles" });
  }
});

// Get a specific profile by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    if (profile.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Create a new profile
router.post("/", authenticate, async (req, res) => {
  const { name, avatar } = req.body;
  try {
    const profile = new Profile({
      user: req.user.id,
      name,
      avatar,
    });
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ message: "Failed to create profile" });
  }
});

// Update a profile
router.put("/:id", authenticate, async (req, res) => {
  const { name, avatar } = req.body;
  try {
    const profile = await Profile.findById(req.params.id);
    if (profile.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    profile.name = name || profile.name;
    profile.avatar = avatar || profile.avatar;
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Delete a profile
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (profile.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await profile.remove();
    res.json({ message: "Profile deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete profile" });
  }
});

// Add to profile watchlist
router.post("/:id/watchlist", authenticate, async (req, res) => {
  const { movieId, title, poster_path, isTV } = req.body;
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    if (profile.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const existingMovie = profile.watchlist.find(item => item.movieId === movieId);
    if (existingMovie) {
      return res.status(400).json({ message: "Movie already in watchlist" });
    }
    
    profile.watchlist.push({ movieId, title, poster_path, isTV });
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Failed to add to watchlist" });
  }
});

// Add to profile favorites
router.post("/:id/favorites", authenticate, async (req, res) => {
  const { movieId, title, poster_path, isTV } = req.body;
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    if (profile.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const existingMovie = profile.favorites.find(item => item.movieId === movieId);
    if (existingMovie) {
      return res.status(400).json({ message: "Movie already in favorites" });
    }
    
    profile.favorites.push({ movieId, title, poster_path, isTV });
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Failed to add to favorites" });
  }
});

// Save profile watch history
router.post("/:id/watch-history", authenticate, async (req, res) => {
  const { movieId, position, isTV } = req.body;
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    if (profile.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const existingIndex = profile.watchHistory.findIndex(item => item.movieId === movieId);
    if (existingIndex > -1) {
      profile.watchHistory[existingIndex].position = position;
      profile.watchHistory[existingIndex].isTV = isTV || false;
      profile.watchHistory[existingIndex].updatedAt = Date.now();
    } else {
      profile.watchHistory.push({
        movieId,
        position: position || 0,
        isTV: isTV || false,
        updatedAt: Date.now()
      });
    }
    
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Failed to save watch history" });
  }
});

export default router;