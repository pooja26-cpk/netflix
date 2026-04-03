import { useEffect, useState } from "react";
import axios from "axios";
import { addToWatchlist, removeFromWatchlist } from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w300";

function Row({ title, fetchUrl, movies: propMovies, onMovieClick, isWatchlist, setWatchlist, isContinueWatching, isTV, watchlist }) {
  const [fetchedMovies, setFetchedMovies] = useState([]);
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { success, error } = useToast();

  // Helper to get the correct image URL
  const getImageUrl = (posterPath) => {
    if (!posterPath) return null;
    // If it's already a full URL (from OMDB or sample data), use it directly
    if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
      return posterPath;
    }
    // Otherwise, prepend the TMDB base URL
    return `${IMAGE_BASE_URL}${posterPath}`;
  };

  useEffect(() => {
    if (fetchUrl && !propMovies) {
      console.log(`Fetching movies for ${title} from: ${fetchUrl}`);
      
      const axiosConfig = {};
      if (user?.accessToken) {
        axiosConfig.headers = { Authorization: `Bearer ${user.accessToken}` };
      }
      
      axios.get(fetchUrl, axiosConfig)
        .then((response) => {
          console.log(`Data received for ${title}:`, response.data);
          // Handle different response formats
          const results = response.data.results || response.data;
          setFetchedMovies(results);
        })
        .catch((error) => {
          console.error(`Error fetching movies for ${title}:`, error);
        });
    }
  }, [fetchUrl, propMovies, title, user]);

  const movies = propMovies || fetchedMovies;

  const handleAddToList = async (movie) => {
    try {
      const addedMovie = await addToWatchlist(movie.id, movie.title || movie.name, movie.poster_path);
      if (setWatchlist) {
        setWatchlist((prevWatchlist) => [...prevWatchlist, addedMovie]);
      }
      success("Added to your watchlist");
    } catch (err) {
      console.error("Error adding to watchlist:", err);
      error("Failed to add to watchlist");
    }
  };

  const handleRemoveFromList = async (movieId) => {
    try {
      await removeFromWatchlist(movieId);
      if (setWatchlist) {
        setWatchlist((prevWatchlist) => prevWatchlist.filter((item) => item.movieId !== movieId));
      }
      success("Removed from your watchlist");
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      error("Failed to remove from watchlist");
    }
  };

  // Filter out movies without poster_path and check if there are any valid movies
  const validMovies = movies.filter((movie) => movie.poster_path);

  // Don't render the row if there are no valid movies
  if (validMovies.length === 0) {
    return null;
  }

  return (
    <div className="px-4 md:px-6 mt-6">
      <h2 className={`${isDark ? 'text-white' : 'text-black'} text-lg md:text-2xl font-semibold mb-4`}>
        {title}
      </h2>

      <div className="flex gap-3 md:gap-4 overflow-x-scroll scrollbar-hide scroll-smooth pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {validMovies.map((movie, index) => {
          // Handle ID discrepancy: TMDB uses 'id', DB uses 'movieId'
          const movieId = movie.id || movie.movieId;
          // Use a combination of index and unique ID to ensure uniqueness
          const uniqueKey = `${movieId}-${movie.title || movie.name || 'unknown'}-${index}`;
          const progress = isContinueWatching ? (movie.position / (movie.runtime || 3600)) * 100 : 0;

          return movie.poster_path ? (
              <div
                key={uniqueKey}
                className="relative w-28 md:w-40 shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105"
                onClick={() => onMovieClick({ ...movie, isTV })}
              >
              {/* IMAGE */}
                <img
                  src={getImageUrl(movie.poster_path)}
                  alt={movie.title || movie.name}
                  className="w-full h-40 md:h-60 object-cover rounded-md shadow-lg"
                />

              {/* Rating Badge */}
              {movie.vote_average && (
                <div className={`absolute top-2 right-2 ${movie.vote_average >= 7.5 ? 'bg-green-500' : movie.vote_average >= 5 ? 'bg-yellow-500' : 'bg-red-500'} text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5`}>
                  <span>⭐</span>
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
              )}

              {isContinueWatching && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-500 rounded-b-md">
                  <div className="h-1 bg-red-600 rounded-b-md" style={{ width: `${progress}%` }}></div>
                </div>
              )}

              {/* HOVER OVERLAY */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-75 transition-all duration-300 rounded-md flex flex-col items-center justify-center p-2 opacity-0 hover:opacity-100">
                <div className="text-white text-center">
                  <h3 className="text-xs md:text-sm font-bold truncate mb-2">
                    {movie.title || movie.name}
                  </h3>
                  {isContinueWatching && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Resume from last position - handled by parent
                        onMovieClick({ ...movie, resumePosition: movie.position });
                      }}
                      className="mt-1 px-2 md:px-3 py-1 bg-green-600 rounded-full hover:bg-green-700 text-xs font-semibold flex items-center gap-1"
                    >
                      ▶ Resume
                    </button>
                  )}
                  {/* Check if movie is in watchlist - show remove for isWatchlist row or if in watchlist */}
                  {isWatchlist || (watchlist && watchlist.some(w => w.id === movieId || w.movieId === movieId)) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromList(movieId);
                      }}
                      className="mt-2 px-2 md:px-3 py-1 bg-red-600 rounded-full hover:bg-red-700 text-xs font-semibold"
                    >
                      - Remove
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToList({ ...movie, isTV });
                      }}
                      className="mt-2 px-2 md:px-3 py-1 bg-white text-black rounded-full hover:bg-gray-200 text-xs font-semibold"
                    >
                      + Add to List
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}

export default Row;