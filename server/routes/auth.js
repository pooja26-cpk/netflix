import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import authenticate from "../verifyToken.js"; // Import the centralized authenticate middleware

const router = express.Router();
const DEFAULT_CLIENT_URL = "https://netflix-bay-eight-16.vercel.app";
const CLIENT_URL = (process.env.CLIENT_URL || DEFAULT_CLIENT_URL).replace(/\/+$/, "");

// Middleware to validate request body
const validateSignup = (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email and password are required" });
  }
  if (username.length < 3) {
    return res.status(400).json({ message: "Username must be at least 3 characters long" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  next();
};

// SIGNUP
router.post("/signup", validateSignup, async (req, res) => {
  console.log("--- SIGNUP ROUTE HIT ---");
  console.log("Request Body:", req.body);
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (userExists) {
      console.log("Signup Error: User already exists.");
      return res.status(400).json({ message: "User with that email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin: false, // Temporarily set to true for testing
    });

    await user.save();
    console.log("Signup Success: User created.");

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({ accessToken: token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error("!!! SIGNUP FAILED !!!", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "User with that email or username already exists" });
    }
    res.status(500).json({ message: "Signup failed due to a server error." });
  }
});

// LOGIN
router.post("/login", validateLogin, async (req, res) => {
  console.log("--- LOGIN ROUTE HIT ---");
  console.log("Request Body:", req.body);
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("Login Error: User not found.");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Login Error: Password does not match.");
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    console.log("Login Success: User authenticated.");

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "30d" } // Extended to 30 days
    );

    res.json({ accessToken: token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error("!!! LOGIN FAILED !!!", err);
    res.status(500).json({ message: "Login failed due to a server error." });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  console.log("--- FORGOT PASSWORD ROUTE HIT ---");
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("Forgot Password Error: User not found.");
      // Still send a success-like response to prevent user enumeration
      return res.status(200).json({ message: "If an account with this email exists, a password reset link has been sent." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Netflix Clone" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Password Reset Link",
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${CLIENT_URL}/reset-password/${token}">Reset Password</a>
             <p>This link will expire in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}`);
    res.status(200).json({ message: "If an account with this email exists, a password reset link has been sent." });

  } catch (err) {
    console.error("!!! FORGOT PASSWORD FAILED !!!", err);
    // Avoid leaking error details
    res.status(500).json({ message: "An error occurred while trying to send the password reset email." });
  }
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  console.log("--- RESET PASSWORD ROUTE HIT ---");
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("Reset Password Error: User not found.");
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    console.log("Password has been reset for user:", user.email);
    res.status(200).json({ message: "Password has been reset successfully." });

  } catch (err) {
    console.error("!!! RESET PASSWORD FAILED !!!", err);
    res.status(400).json({ message: "Invalid or expired token." });
  }
});


// DELETE USER ACCOUNT
router.delete("/delete-account", authenticate, async (req, res) => {
  console.log("--- DELETE ACCOUNT ROUTE HIT ---");
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      console.log("Delete Account Error: User not found.");
      return res.status(404).json({ message: "User not found." });
    }

    await User.findByIdAndDelete(userId);

    console.log("Account deleted successfully for user:", user.email);
    res.status(200).json({ message: "Account deleted successfully." });

  } catch (err) {
    console.error("!!! DELETE ACCOUNT FAILED !!!", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

// WATCHLIST ROUTES
router.post("/watchlist", authenticate, async (req, res) => {
  console.log("--- ADD TO WATCHLIST ROUTE HIT ---");
  try {
    const { movieId, title, poster_path, isTV } = req.body;
    const userId = req.user.id;
    console.log("User ID:", userId, "Movie ID:", movieId, "Title:", title);

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user.username, user.email);

    // Check if movie is already in watchlist
    const existingMovie = user.watchlist.find(item => item.movieId === movieId);
    if (existingMovie) {
      console.log("Movie already in watchlist");
      return res.status(400).json({ message: "Movie already in watchlist" });
    }

    console.log("Pushing to watchlist:", { movieId, title, poster_path, isTV });
    user.watchlist.push({ movieId, title, poster_path, isTV });
    console.log("User before save:", JSON.stringify(user, null, 2));
    await user.save();

    console.log("Movie added to watchlist for user:", user.email);
    res.status(201).json({ message: "Added to watchlist" });

  } catch (err) {
    console.error("!!! ADD TO WATCHLIST FAILED !!!", err);
    res.status(500).json({ message: "Failed to add to watchlist" });
  }
});

router.get("/watchlist", authenticate, async (req, res) => {
  console.log("--- GET WATCHLIST ROUTE HIT ---");
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.watchlist);

  } catch (err) {
    console.error("!!! GET WATCHLIST FAILED !!!", err);
    res.status(500).json({ message: "Failed to fetch watchlist" });
  }
});

router.delete("/watchlist/:movieId", authenticate, async (req, res) => {
  console.log("--- REMOVE FROM WATCHLIST ROUTE HIT ---");
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.watchlist = user.watchlist.filter(item => item.movieId !== parseInt(movieId));
    await user.save();

    console.log("Movie removed from watchlist for user:", user.email);
    res.json({ message: "Removed from watchlist" });

  } catch (err) {
    console.error("!!! REMOVE FROM WATCHLIST FAILED !!!", err);
    res.status(500).json({ message: "Failed to remove from watchlist" });
  }
});

// FAVORITES ROUTES
router.post("/favorites", authenticate, async (req, res) => {
  try {
    const { movieId, title, poster_path, isTV } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure movieId is stored as a number for consistent comparison
    const movieIdNum = Number(movieId);
    
    // Check if movie is already in favorites
    const existingMovie = user.favorites.find(item => item.movieId === movieIdNum);
    if (existingMovie) {
      return res.status(400).json({ message: "Movie already in favorites" });
    }

    user.favorites.push({ movieId: movieIdNum, title, poster_path, isTV });
    await user.save();

    console.log("Movie added to favorites for user:", user.email);
    res.status(201).json({ message: "Added to favorites", favorites: user.favorites });
  } catch (err) {
    console.error("!!! ADD TO FAVORITES FAILED !!!", err);
    res.status(500).json({ message: "Failed to add to favorites" });
  }
});

router.get("/favorites", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.favorites);
  } catch (err) {
    console.error("!!! GET FAVORITES FAILED !!!", err);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
});

router.delete("/favorites/:movieId", authenticate, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.favorites = user.favorites.filter(item => item.movieId !== Number(movieId));
    await user.save();

    console.log("Movie removed from favorites for user:", user.email);
    res.json({ message: "Removed from favorites", favorites: user.favorites });
  } catch (err) {
    console.error("!!! REMOVE FROM FAVORITES FAILED !!!", err);
    res.status(500).json({ message: "Failed to remove from favorites" });
  }
});

// WATCH HISTORY ROUTES
router.post("/watch-history", authenticate, async (req, res) => {
  console.log("--- SAVE WATCH HISTORY ROUTE HIT ---");
  try {
    const { movieId, position, isTV } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if movie already exists in watch history
    const existingIndex = user.watchHistory.findIndex(item => item.movieId === movieId);
    
    if (existingIndex > -1) {
      // Update existing entry
      user.watchHistory[existingIndex].position = position;
      user.watchHistory[existingIndex].isTV = isTV || false;
      user.watchHistory[existingIndex].updatedAt = Date.now();
    } else {
      // Add new entry
      user.watchHistory.push({
        movieId,
        position: position || 0,
        isTV: isTV || false,
        updatedAt: Date.now()
      });
    }

    await user.save();
    console.log("Watch history saved for user:", user.email);
    res.json({ message: "Watch history saved", watchHistory: user.watchHistory });

  } catch (err) {
    console.error("!!! SAVE WATCH HISTORY FAILED !!!", err);
    res.status(500).json({ message: "Failed to save watch history" });
  }
});

router.get("/watch-history", authenticate, async (req, res) => {
  console.log("--- GET WATCH HISTORY ROUTE HIT ---");
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.watchHistory);

  } catch (err) {
    console.error("!!! GET WATCH HISTORY FAILED !!!", err);
    res.status(500).json({ message: "Failed to fetch watch history" });
  }
});

export default router;
