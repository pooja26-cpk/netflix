import React from "react";
import FavoriteButton from "./FavoriteButton";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

const IMAGE_PATH = "https://image.tmdb.org/t/p/w500";

const MovieCard = ({ movie, onMovieClick, isFavorite, showRemove = false, onRemove }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { success, error, info } = useToast();
  const { user } = useAuth();
  const [isRemoving, setIsRemoving] = React.useState(false);
  // Helper to get the correct image URL
  const getImageUrl = (posterPath) => {
    if (!posterPath) return null;
    // If it's already a full URL (from OMDB or sample data), use it directly
    if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
      return posterPath;
    }
    // Otherwise, prepend the TMDB base URL
    return `${IMAGE_PATH}${posterPath}`;
  };

  // Get rating - prefer vote_average from TMDB
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const ratingColor = rating >= 7.5 ? "bg-green-500" : rating >= 5 ? "bg-yellow-500" : "bg-red-500";

  const handleRemoveFromWatchlist = async () => {
    if (!user || !user.accessToken) {
      info("Please login to manage your watchlist");
      return;
    }

    setIsRemoving(true);
    try {
      const base = import.meta.env.VITE_API_URL || "https://netflix-server-production-4cdc.up.railway.app/api";
      const movieId = movie.movieId || movie.id;
      await axios.delete(`${base}/auth/watchlist/${movieId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      success("Removed from your watchlist");
      if (onRemove) {
        onRemove(movieId);
      }
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      error("Failed to remove from watchlist");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div 
      className="cursor-pointer relative rounded overflow-hidden transition-transform duration-200 hover:scale-105 aspect-2/3 group" 
      onClick={() => onMovieClick(movie)}
    >
      <img 
        src={getImageUrl(movie.poster_path)} 
        alt={movie.title || movie.name} 
        className="w-full h-full object-cover block" 
      />
      {/* Rating Badge */}
      {rating && (
        <div className={`absolute top-2 right-2 ${ratingColor} text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1`}>
          <span>⭐</span>
          <span>{rating}</span>
        </div>
      )}
      {/* Favorite Button */}
      <div className="absolute top-2 left-2 z-10 opacity-100 group-hover:opacity-100 transition-opacity duration-200">
        <FavoriteButton movie={movie} isFavorite={isFavorite} />
      </div>
      <div className={`absolute bottom-0 left-0 right-0 ${isDark ? 'bg-black/70 text-white' : 'bg-white/70 text-black'} p-2 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-sm`}>
        <h5 className="truncate">{movie.title || movie.name}</h5>
        {showRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFromWatchlist();
            }}
            disabled={isRemoving}
            className="mt-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold w-full"
          >
            {isRemoving ? "Removing..." : "Remove from Watchlist"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
