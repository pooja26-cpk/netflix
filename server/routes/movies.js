import express from "express";
import axios from "axios";
import authenticate from "../verifyToken.js";
import User from "../models/User.js";

const router = express.Router();

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const getTmdbConfig = () => ({
  baseURL: TMDB_BASE_URL,
  timeout: 15000,
  headers: {
    'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  },
  params: {
    api_key: TMDB_API_KEY
  }
});

const tmdbApi = axios.create(getTmdbConfig());

// Log TMDB status for debugging
console.log("TMDB_API_KEY present:", !!TMDB_API_KEY);
console.log("TMDB_ACCESS_TOKEN present:", !!TMDB_ACCESS_TOKEN);

// Test TMDB key validity on startup (non-blocking)
(async () => {
  try {
    const testResponse = await tmdbApi.get('/movie/popular', {
      params: { page: 1 }
    });
    if (testResponse.data) {
      console.log("✅ TMDB API key test successful");
    } else {
      console.warn("⚠️ TMDB API test failed");
    }
  } catch (error) {
    console.warn("⚠️ TMDB API test failed (non-critical):", error.code || error.message);
    console.warn("The server will continue but TMDB features may not work.");
  }
})();

// Helper function to get full image URL
const getImageUrl = (path, size = "original") => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Genre ID to Name mapping
const genreIdMap = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

// TV Genre mapping
const tvGenreIdMap = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western"
};

// Trending Movies
router.get("/trending", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdbApi.get("/trending/movie/week", {
      params: { page: parseInt(page) }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB trending error:", err.message);
    res.status(500).json({ message: "Failed to fetch trending movies" });
  }
});

// Popular Movies
router.get("/popular", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdbApi.get("/movie/popular", {
      params: { page: parseInt(page) }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB popular error:", err.message);
    res.status(500).json({ message: "Failed to fetch popular movies" });
  }
});

// Top Rated Movies
router.get("/top-rated", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdbApi.get("/movie/top_rated", {
      params: { page: parseInt(page) }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB top rated error:", err.message);
    res.status(500).json({ message: "Failed to fetch top rated movies" });
  }
});

// Netflix Originals
router.get("/discover/movie", async (req, res) => {
  const { with_networks, with_genres, with_original_language, sort_by, page = 1 } = req.query;
  
  try {
    const params = { page: parseInt(page) };
    
    if (with_networks) {
      params.with_networks = with_networks;
    }
    if (with_genres) {
      params.with_genres = with_genres;
    }
    if (with_original_language) {
      params.with_original_language = with_original_language;
    }
    if (sort_by) {
      params.sort_by = sort_by;
    } else {
      params.sort_by = "popularity.desc";
    }
    
    const response = await tmdbApi.get("/discover/movie", { params });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB discover error:", err.message);
    res.status(500).json({ message: "Failed to fetch discovered movies" });
  }
});

// Search Movies
router.get("/search", async (req, res) => {
  const { query, page = 1 } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }
  
  try {
    const response = await tmdbApi.get("/search/movie", {
      params: { 
        query, 
        page: parseInt(page),
        include_adult: false
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB search error:", err.message);
    res.status(500).json({ message: "Failed to search movies" });
  }
});

// Get Genres
router.get("/genres", async (req, res) => {
  try {
    const response = await tmdbApi.get("/genre/movie/list");
    res.json(response.data);
  } catch (err) {
    console.error("TMDB genres error:", err.message);
    res.status(500).json({ message: "Failed to fetch genres" });
  }
});

// Movies by Genre
router.get("/genre/:id", async (req, res) => {
  const { id } = req.params;
  const { page = 1 } = req.query;
  
  try {
    const response = await tmdbApi.get("/discover/movie", {
      params: { 
        with_genres: id, 
        page: parseInt(page),
        sort_by: "popularity.desc"
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB genre error:", err.message);
    res.status(500).json({ message: "Failed to fetch movies by genre" });
  }
});

// Movie Details
router.get("/movie/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const response = await tmdbApi.get(`/movie/${id}`);
    res.json(response.data);
  } catch (err) {
    console.error("TMDB movie detail error:", err.message);
    res.status(500).json({ message: "Failed to fetch movie details" });
  }
});

// Movie Credits
router.get("/movie/:id/credits", async (req, res) => {
  const { id } = req.params;
  
  try {
    const response = await tmdbApi.get(`/movie/${id}/credits`);
    res.json(response.data);
  } catch (err) {
    console.error("TMDB credits error:", err.message);
    res.status(500).json({ message: "Failed to fetch movie credits" });
  }
});

// Movie Reviews
router.get("/movie/:id/reviews", async (req, res) => {
  const { id } = req.params;
  const { page = 1 } = req.query;
  
  try {
    const response = await tmdbApi.get(`/movie/${id}/reviews`, {
      params: { page: parseInt(page) }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB reviews error:", err.message);
    res.status(500).json({ message: "Failed to fetch movie reviews" });
  }
});

// Movie Recommendations
router.get("/movie/:id/recommendations", async (req, res) => {
  const { id } = req.params;
  const { page = 1 } = req.query;
  
  try {
    const response = await tmdbApi.get(`/movie/${id}/recommendations`, {
      params: { page: parseInt(page) }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB recommendations error:", err.message);
    res.status(500).json({ message: "Failed to fetch movie recommendations" });
  }
});

// Movie Similar (Similar Movies)
router.get("/movie/:id/similar", async (req, res) => {
  const { id } = req.params;
  const { page = 1 } = req.query;
  
  try {
    const response = await tmdbApi.get(`/movie/${id}/similar`, {
      params: { page: parseInt(page) }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB similar movies error:", err.message);
    res.status(500).json({ message: "Failed to fetch similar movies" });
  }
});

// TV Show Endpoints
router.get("/tv/trending", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdbApi.get("/trending/tv/week", {
      params: { page: parseInt(page) }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB TV trending error:", err.message);
    res.status(500).json({ message: "Failed to fetch trending TV shows" });
  }
});

router.get("/tv/popular", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdbApi.get("/tv/popular", {
      params: { page: parseInt(page) }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB TV popular error:", err.message);
    res.status(500).json({ message: "Failed to fetch popular TV shows" });
  }
});

router.get("/tv/top-rated", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdbApi.get("/tv/top_rated", {
      params: { page: parseInt(page) }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB TV top rated error:", err.message);
    res.status(500).json({ message: "Failed to fetch top rated TV shows" });
  }
});

router.get("/tv/genre/:id", async (req, res) => {
  const { id } = req.params;
  const { page = 1 } = req.query;
  
  try {
    const response = await tmdbApi.get("/discover/tv", {
      params: { 
        with_genres: id, 
        page: parseInt(page),
        sort_by: "popularity.desc"
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB TV genre error:", err.message);
    res.status(500).json({ message: "Failed to fetch TV shows by genre" });
  }
});

router.get("/tv/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await tmdbApi.get(`/tv/${id}`);
    res.json(response.data);
  } catch (err) {
    console.error("TMDB TV detail error:", err.message);
    res.status(500).json({ message: "Failed to fetch TV show details" });
  }
});

router.get("/tv/:id/credits", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await tmdbApi.get(`/tv/${id}/credits`);
    res.json(response.data);
  } catch (err) {
    console.error("TMDB TV credits error:", err.message);
    res.status(500).json({ message: "Failed to fetch TV show credits" });
  }
});

router.get("/tv/:id/videos", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await tmdbApi.get(`/tv/${id}/videos`);
    res.json(response.data);
  } catch (err) {
    console.error("TMDB TV videos error:", err.message);
    res.status(500).json({ message: "Failed to fetch TV show videos" });
  }
});

// Regional Movies - Using TMDB discover with language filter
router.get("/movies-by-language", async (req, res) => {
  const { language } = req.query;
  if (!language) {
    return res.status(400).json({ message: "Language parameter is required" });
  }
  
  // TMDB uses ISO 639-1 language codes
  const languageMap = {
    "ta": "ta",
    "te": "te",
    "kn": "kn",
    "ml": "ml",
    "mr": "mr",
    "hi": "hi",
    "es": "es",
    "fr": "fr",
    "de": "de",
    "zh": "zh",
    "ja": "ja",
    "ko": "ko",
    "en": "en"
  };
  
  const tmdbLanguage = languageMap[language];
  if (!tmdbLanguage) {
    return res.status(400).json({ message: "Unsupported language" });
  }
  
  try {
    const response = await tmdbApi.get("/discover/movie", {
      params: { 
        with_original_language: tmdbLanguage,
        sort_by: "popularity.desc",
        page: 1
      }
    });
    res.json({
      page: 1,
      results: response.data.results || [],
      total_pages: response.data.total_pages,
      total_results: response.data.total_results
    });
  } catch (err) {
    console.error(`TMDB movies by language (${language}) error:`, err.message);
    res.status(500).json({ message: `Failed to fetch movies in language: ${language}` });
  }
});

router.get("/trending-by-language", async (req, res) => {
  const { language } = req.query;
  if (!language) {
    return res.status(400).json({ message: "Language parameter is required" });
  }
  
  const languageMap = {
    "ta": "ta", "te": "te", "kn": "kn", "ml": "ml",
    "mr": "mr", "hi": "hi", "es": "es", "fr": "fr",
    "de": "de", "zh": "zh", "ja": "ja", "ko": "ko"
  };
  
  const tmdbLanguage = languageMap[language];
  if (!tmdbLanguage) {
    return res.status(400).json({ message: "Unsupported language" });
  }
  
  try {
    const response = await tmdbApi.get("/discover/movie", {
      params: { 
        with_original_language: tmdbLanguage,
        sort_by: "popularity.desc",
        page: 1
      }
    });
    res.json({
      page: 1,
      results: response.data.results || [],
      total_pages: response.data.total_pages,
      total_results: response.data.total_results
    });
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch trending movies in language: ${language}` });
  }
});

router.get("/popular-by-language", async (req, res) => {
  const { language } = req.query;
  if (!language) {
    return res.status(400).json({ message: "Language parameter is required" });
  }
  
  const languageMap = {
    "ta": "ta", "te": "te", "kn": "kn", "ml": "ml",
    "mr": "mr", "hi": "hi", "es": "es", "fr": "fr",
    "de": "de", "zh": "zh", "ja": "ja", "ko": "ko"
  };
  
  const tmdbLanguage = languageMap[language];
  if (!tmdbLanguage) {
    return res.status(400).json({ message: "Unsupported language" });
  }
  
  try {
    const response = await tmdbApi.get("/discover/movie", {
      params: { 
        with_original_language: tmdbLanguage,
        sort_by: "popularity.desc",
        page: 1
      }
    });
    res.json({
      page: 1,
      results: response.data.results || [],
      total_pages: response.data.total_pages,
      total_results: response.data.total_results
    });
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch popular movies in language: ${language}` });
  }
});

// Advanced search with filters
router.get("/search-advanced", async (req, res) => {
  const { query, with_genres, sort_by, page = 1 } = req.query;
  
  try {
    if (with_genres) {
      // Use discover for genre-based search
      const response = await tmdbApi.get("/discover/movie", {
        params: {
          with_genres,
          sort_by: sort_by || "popularity.desc",
          page: parseInt(page)
        }
      });
      res.json(response.data);
    } else if (query) {
      // Use search for text query
      const response = await tmdbApi.get("/search/movie", {
        params: {
          query,
          page: parseInt(page),
          include_adult: false
        }
      });
      res.json(response.data);
    } else {
      res.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
    }
  } catch (err) {
    console.error("TMDB advanced search error:", err.message);
    res.status(500).json({ message: "Failed to perform advanced search" });
  }
});

// Movie Videos (Trailers)
router.get("/movie/:id/videos", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await tmdbApi.get(`/movie/${id}/videos`);
    res.json(response.data);
  } catch (err) {
    console.error("TMDB movie videos error:", err.message);
    res.status(500).json({ message: "Failed to fetch movie videos" });
  }
});

// Movie recommendations
router.get("/recommendations", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("watchHistory.movieId");

    if (!user || user.watchHistory.length === 0) {
      // Return popular movies as default recommendations
      const response = await tmdbApi.get("/movie/popular", {
        params: { page: 1 }
      });
      return res.json(response.data.results?.slice(0, 10) || []);
    }

    // Get genre preferences from watch history
    const genreCounts = {};
    user.watchHistory.forEach(item => {
      if (item.movieId && item.movieId.genres) {
        item.movieId.genres.forEach(genre => {
          genreCounts[genre.id] = (genreCounts[genre.id] || 0) + 1;
        });
      }
    });

    // Get top genres
    const topGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id);

    if (topGenres.length > 0) {
      const response = await tmdbApi.get("/discover/movie", {
        params: {
          with_genres: topGenres.join(','),
          sort_by: "popularity.desc",
          page: 1
        }
      });
      res.json(response.data.results?.slice(0, 10) || []);
    } else {
      const response = await tmdbApi.get("/movie/popular", {
        params: { page: 1 }
      });
      res.json(response.data.results?.slice(0, 10) || []);
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    // Fallback to popular movies
    try {
      const response = await tmdbApi.get("/movie/popular", {
        params: { page: 1 }
      });
      res.json(response.data.results?.slice(0, 10) || []);
    } catch (fallbackError) {
      res.json([]);
    }
  }
});

// Search for actors
router.get("/search-person", async (req, res) => {
  const { query, page = 1 } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }
  
  try {
    const response = await tmdbApi.get("/search/person", {
      params: { 
        query, 
        page: parseInt(page)
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB person search error:", err.message);
    res.status(500).json({ message: "Failed to search for actors" });
  }
});

// Filter movies by actor and/or language
router.get("/filter", async (req, res) => {
  const { actor_id, actor_name, language, page = 1 } = req.query;
  
  try {
    let actorId = actor_id;
    
    // If actor_name is provided but not actor_id, search for the actor first
    if (!actorId && actor_name) {
      const personSearch = await tmdbApi.get("/search/person", {
        params: { query: actor_name }
      });
      
      if (personSearch.data.results && personSearch.data.results.length > 0) {
        actorId = personSearch.data.results[0].id;
      } else {
        return res.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
      }
    }
    
    // Build filter params
    const params = {
      sort_by: "popularity.desc",
      page: parseInt(page)
    };
    
    if (actorId) {
      params.with_cast = actorId;
    }
    
    // Handle language filter
    const languageMap = {
      "ta": "ta",
      "te": "te",
      "kn": "kn",
      "ml": "ml",
      "mr": "mr",
      "hi": "hi",
      "es": "es",
      "fr": "fr",
      "de": "de",
      "zh": "zh",
      "ja": "ja",
      "ko": "ko",
      "en": "en"
    };
    
    if (language && languageMap[language]) {
      params.with_original_language = languageMap[language];
    }
    
    const response = await tmdbApi.get("/discover/movie", { params });
    res.json(response.data);
  } catch (err) {
    console.error("TMDB filter error:", err.message);
    res.status(500).json({ message: "Failed to filter movies" });
  }
});

// Tamil Movie Recommendations (personalized for users who watch Tamil movies)
router.get("/tamil-recommendations", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("watchHistory.movieId");
    
    // Get user's preferred genres from watch history
    const genreCounts = {};
    if (user && user.watchHistory.length > 0) {
      user.watchHistory.forEach(item => {
        if (item.movieId && item.movieId.genres) {
          item.movieId.genres.forEach(genre => {
            genreCounts[genre.id] = (genreCounts[genre.id] || 0) + 1;
          });
        }
      });
    }
    
    // Get top genres
    const topGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id);
    
    // Fetch Tamil movies with user's preferred genres
    const params = {
      with_original_language: "ta",
      sort_by: "popularity.desc",
      page: 1
    };
    
    if (topGenres.length > 0) {
      params.with_genres = topGenres.join(',');
    }
    
    const response = await tmdbApi.get("/discover/movie", { params });
    res.json(response.data.results?.slice(0, 10) || []);
  } catch (error) {
    console.error("Error fetching Tamil recommendations:", error);
    // Fallback to popular Tamil movies
    try {
      const response = await tmdbApi.get("/discover/movie", {
        params: {
          with_original_language: "ta",
          sort_by: "popularity.desc",
          page: 1
        }
      });
      res.json(response.data.results?.slice(0, 10) || []);
    } catch (fallbackError) {
      res.json([]);
    }
  }
});

export default router;
