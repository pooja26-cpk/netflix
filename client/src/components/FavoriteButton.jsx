import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";
import { apiUrl } from "../api/baseUrl";

function FavoriteButton({ movie, isFavorite = false, onToggle = () => {} }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { success, error, info } = useToast();
  const [favorite, setFavorite] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  // Sync with prop when it changes
  useEffect(() => {
    setFavorite(isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();

    if (!user) {
      info("Please login to add favorites");
      return;
    }

    try {
      setLoading(true);
      const base = apiUrl();
      // Ensure movieId is a number for consistent API calls
      const movieId = Number(movie.id || movie.movieId);

      if (favorite) {
        // Remove from favorites
        await axios.delete(`${base}/auth/favorites/${movieId}`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        success("Removed from your favorites");
      } else {
        // Add to favorites
        await axios.post(
          `${base}/auth/favorites`,
          {
            movieId: movieId,
            title: movie.title || movie.name,
            poster_path: movie.poster_path,
            isTV: movie.isTV || false,
          },
          {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }
        );
        success("Added to your favorites");
      }

      setFavorite(!favorite);
      onToggle(!favorite);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      // Provide more specific error messages based on the error type
      if (err.response) {
        // Server responded with an error status
        const message = err.response.data?.message || "Server error occurred";
        error(`Failed to update favorite: ${message}`);
      } else if (err.request) {
        // Request was made but no response received
        error("Failed to update favorite: No response from server");
      } else {
        error("Failed to update favorite");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full ${isDark ? 'bg-black/60 hover:bg-black/80' : 'bg-white/60 hover:bg-white/80'} transition-all duration-300 ${
        favorite ? "text-red-600 scale-110" : isDark ? "text-white hover:text-red-500" : "text-black hover:text-red-500"
      } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={favorite ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        className="w-6 h-6"
        fill={favorite ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

export default FavoriteButton;
