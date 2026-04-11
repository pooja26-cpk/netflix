import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoPlayer from "./VideoPlayer";
import ReviewSection from "./ReviewSection";
import FavoriteButton from "./FavoriteButton";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";
import { apiUrl } from "../api/baseUrl";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

// Helper to get the correct image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already a full URL (from OMDB or sample data), use it directly
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, prepend the TMDB base URL
  return `${IMAGE_BASE_URL}${imagePath}`;
};

function MovieModal({ movie, onClose, onAddToList, onRemoveFromWatchlist }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { success, error: showError, info } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movie) return;

      try {
        setLoading(true);
        const base = apiUrl();
        
        // Fetch movie details and videos in parallel
        const [detailsResponse, videosResponse] = await Promise.all([
          axios.get(`${base}/movie/${movie.id || movie.movieId}`),
          axios.get(`${base}/movie/${movie.id || movie.movieId}/videos`)
        ]);
        
        // Combine details with videos
        const detailsWithVideos = {
          ...detailsResponse.data,
          videos: videosResponse.data
        };
        setMovieDetails(detailsWithVideos);

        if (user && user.accessToken) {
          const [watchlistResponse, favoritesResponse] = await Promise.all([
            axios.get(`${base}/auth/watchlist`, {
              headers: { Authorization: `Bearer ${user.accessToken}` },
            }),
            axios.get(`${base}/auth/favorites`, {
              headers: { Authorization: `Bearer ${user.accessToken}` },
            })
          ]);
          const inList = watchlistResponse.data.some(
            (item) => Number(item.movieId) === Number(movie.id || movie.movieId)
          );
          setIsInWatchlist(inList);
          
          // Check if movie is in favorites
          const inFavorites = favoritesResponse.data.some(
            (item) => Number(item.movieId) === Number(movie.id || movie.movieId)
          );
          setIsFavorite(inFavorites);
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setMovieDetails(movie); // Fallback to original movie object
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movie, user]);

  if (!movie) return null;

  const displayMovie = movieDetails || movie;
  const hasTrailer = displayMovie.videos?.results?.some(
    (v) => v.type === "Trailer" || v.type === "Teaser"
  );

  const handleCloseTrailer = () => {
    setShowTrailer(false);
  };

  const handleToggleWatchlist = async () => {
    if (!user || !user.accessToken) {
      info("Please login to update your watchlist");
      return;
    }

    if (isUpdating) return;
    setIsUpdating(true);

    const base = apiUrl();
    const movieId = displayMovie.id || displayMovie.movieId;

    try {
      if (isInWatchlist) {
        await axios.delete(`${base}/auth/watchlist/${movieId}`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        setIsInWatchlist(false);
        if (onRemoveFromWatchlist) onRemoveFromWatchlist(movieId);
        success("Removed from your watchlist");
      } else {
        await axios.post(
          `${base}/auth/watchlist`,
          {
            movieId: movieId,
            title: displayMovie.title || displayMovie.name,
            poster_path: displayMovie.poster_path,
            isTV: displayMovie.media_type === "tv",
          },
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
        setIsInWatchlist(true);
        if (onAddToList) onAddToList(displayMovie);
        success("Added to your watchlist");
      }
    } catch (err) {
      console.error("Error updating watchlist:", err);
      showError("Failed to update watchlist");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'} rounded-lg shadow-lg max-w-2xl w-full relative my-4 md:my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-2 right-2 md:top-4 md:right-4 ${isDark ? 'text-white' : 'text-black'} text-xl md:text-2xl z-10 ${isDark ? 'bg-black/50' : 'bg-gray-200'} rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:${isDark ? 'bg-black/70' : 'bg-gray-300'} transition`}
        >
          &times;
        </button>

        <div className="relative">
          {showTrailer && hasTrailer ? (
            <div className="relative pt-[56.25%] w-full rounded-t-lg overflow-hidden">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${displayMovie.videos?.results?.find((v) => v.type === "Trailer" || v.type === "Teaser")?.key}?autoplay=1`}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <button
                onClick={handleCloseTrailer}
                className="absolute top-2 right-2 text-white bg-black/70 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/90 z-10"
              >
                &times;
              </button>
            </div>
          ) : (
            <>
              <img
                src={getImageUrl(displayMovie.backdrop_path || displayMovie.poster_path)}
                alt={displayMovie.title || displayMovie.name}
                className="w-full h-32 sm:h-48 md:h-64 object-cover rounded-t-lg"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-gray-900' : 'from-gray-800'} ${isDark ? 'via-gray-900/40' : 'via-gray-800/40'} to-transparent rounded-t-lg`}></div>
            </>
          )}

          <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex flex-col sm:flex-row sm:items-end gap-1.5 sm:gap-2">
            <div className="flex-1">
              <h2 className={`text-lg sm:text-xl md:text-2xl font-bold line-clamp-2 ${isDark ? 'text-white' : 'text-white'}`}>
                {displayMovie.title || displayMovie.name}
              </h2>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              {hasTrailer && !showTrailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="px-3 sm:px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded font-semibold flex items-center gap-2 transition"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  <span className="text-xs sm:text-sm">Play Trailer</span>
                </button>
              )}
              <button
                onClick={handleToggleWatchlist}
                disabled={isUpdating}
                className={`px-2 sm:px-3 py-1.5 rounded font-semibold flex items-center gap-1 sm:gap-2 transition ${
                  isInWatchlist
                    ? isDark ? "bg-gray-700 hover:bg-gray-800 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"
                    : isDark ? "bg-gray-600 hover:bg-gray-700 text-white" : "bg-gray-400 hover:bg-gray-500 text-black"
                }`}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isInWatchlist ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  )}
                </svg>
                <span className="text-xs sm:text-sm">
                  {isInWatchlist ? "In Watchlist" : "Add to List"}
                </span>
              </button>
              <div className="py-1.5">
                <FavoriteButton 
                  movie={displayMovie} 
                  isFavorite={isFavorite}
                  onToggle={(newFavoriteState) => setIsFavorite(newFavoriteState)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`p-2 sm:p-3 md:p-4 overflow-y-auto max-h-[40vh] sm:max-h-[50vh] ${isDark ? 'text-white' : 'text-black'}`}>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading details...</p>
            </div>
          ) : (
            <>
              <p className={`text-xs sm:text-sm md:text-base mb-3 md:mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {displayMovie.overview}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs sm:text-sm">
                <div>
                  <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Release Date:
                  </span>{" "}
                  {displayMovie.release_date ||
                    displayMovie.first_air_date ||
                    "N/A"}
                </div>
                <div>
                  <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rating:</span>{" "}
                  {displayMovie.vote_average?.toFixed(1) || "N/A"} / 10
                </div>
                {displayMovie.genres && displayMovie.genres.length > 0 && (
                  <div className="sm:col-span-2">
                    <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Genres:</span>{" "}
                    {displayMovie.genres.map((g) => g.name).join(", ")}
                  </div>
                )}
                {displayMovie.runtime && (
                  <div>
                    <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Runtime:
                    </span>{" "}
                    {displayMovie.runtime} min
                  </div>
                )}
              </div>

              <div className={`mt-4 md:mt-6 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                <ReviewSection
                  movieId={displayMovie.id || displayMovie.movieId}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieModal;
