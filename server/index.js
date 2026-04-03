import 'dotenv/config';
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import User from "./models/User.js";
import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import listRoutes from "./routes/lists.js";
import reviewRoutes from "./routes/reviews.js";
import profileRoutes from "./routes/profiles.js";
import authenticate from "./verifyToken.js";



console.log("Starting server...");

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log("Environment variables loaded.");
console.log(`MONGO_URI: ${process.env.MONGO_URI ? 'Loaded' : 'Missing'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Loaded' : 'Missing'}`);
console.log(`TMDB_API_KEY: ${process.env.TMDB_API_KEY ? 'Loaded' : 'Missing'}`);
console.log(`CLIENT_URL: ${process.env.CLIENT_URL || 'https://netflix-clone-client-f49g.onrender.com'}`);
console.log(`PORT: ${process.env.PORT || 5000}`);

const app = express();
console.log("Express app created.");

// Database Connection
console.log("Attempting to connect to MongoDB...");

const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 1,
  retryWrites: true,
  retryReads: true
};

mongoose.connect(process.env.MONGO_URI, mongooseOptions)
.then(() => {
  console.log("✅ DB Connection Successful");
})
.catch((err) => {
  console.error("❌ Initial DB Connection Error:", err.message);
  console.error("Please ensure your IP is whitelisted in MongoDB Atlas:");
  console.error("1. Go to https://www.mongodb.com/atlas/database");
  console.error("2. Click 'Network Access' in the left sidebar");
  console.error("3. Click '+ Add IP Address'");
  console.error("4. Add your current IP or use 0.0.0.0/0 for development");
  process.exit(1); // Exit the process if DB connection fails
});

mongoose.connection.on('error', err => {
  console.error("MongoDB connection error:", err);
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "https://netflix-clone-client-f49g.onrender.com",
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for potential future use
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api", movieRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/profiles", profileRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Backend running successfully",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Test endpoints for verification
app.get("/api/test/auth", (req, res) => {
  res.json({
    message: "✅ Auth endpoints are accessible",
    endpoints: [
      "POST /api/auth/signup",
      "POST /api/auth/login",
      "POST /api/auth/forgot-password",
      "POST /api/auth/reset-password/:token",
      "GET /api/auth/watchlist",
      "POST /api/auth/watchlist",
      "DELETE /api/auth/watchlist/:movieId"
    ]
  });
});

app.get("/api/test/movies", (req, res) => {
  res.json({
    message: "✅ Movie endpoints are accessible (OMDb API)",
    categories: {
      trending_and_popular: [
        "GET /api/trending",
        "GET /api/popular",
        "GET /api/top-rated"
      ],
      search_and_filters: [
        "GET /api/search?query=NAME",
        "GET /api/genres",
        "GET /api/genre/:id",
        "GET /api/search-advanced?query=&with_genres=&language="
      ],
      regional_indian_languages: [
        "GET /api/movies-by-language?language=ta (Tamil)",
        "GET /api/movies-by-language?language=te (Telugu)",
        "GET /api/movies-by-language?language=kn (Kannada)",
        "GET /api/movies-by-language?language=ml (Malayalam)",
        "GET /api/movies-by-language?language=mr (Marathi)",
        "GET /api/movies-by-language?language=hi (Hindi)"
      ],
      trending_by_language: [
        "GET /api/trending-by-language?language=ta (Tamil)",
        "GET /api/trending-by-language?language=te (Telugu)",
        "GET /api/trending-by-language?language=kn (Kannada)",
        "GET /api/trending-by-language?language=ml (Malayalam)",
        "GET /api/trending-by-language?language=mr (Marathi)",
        "GET /api/trending-by-language?language=hi (Hindi)"
      ],
      popular_by_language: [
        "GET /api/popular-by-language?language=ta (Tamil)",
        "GET /api/popular-by-language?language=te (Telugu)",
        "GET /api/popular-by-language?language=kn (Kannada)",
        "GET /api/popular-by-language?language=ml (Malayalam)",
        "GET /api/popular-by-language?language=mr (Marathi)",
        "GET /api/popular-by-language?language=hi (Hindi)"
      ],
      international_languages: [
        "GET /api/movies-by-language?language=es (Spanish)",
        "GET /api/movies-by-language?language=fr (French)",
        "GET /api/movies-by-language?language=de (German)",
        "GET /api/movies-by-language?language=zh (Chinese)",
        "GET /api/movies-by-language?language=ja (Japanese)",
        "GET /api/movies-by-language?language=ko (Korean)"
      ],
      movie_details: [
        "GET /api/movie/:id",
        "GET /api/movie/:id/credits",
        "GET /api/movie/:id/videos",
        "GET /api/movie/:id/reviews",
        "GET /api/movie/:id/recommendations"
      ]
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || "https://netflix-clone-client-f49g.onrender.com"}`);
});
