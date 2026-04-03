import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieModal from "./MovieModal";
import { useTheme } from "../hooks/useTheme";

function ContinueWatchingRow({ movies = [] }) {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!movies || movies.length === 0) {
    return null;
  }

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handleResume = (movie) => {
    navigate("/watch", { state: { movie, resumeFrom: movie.position || 0 } });
  };

  const getProgressPercentage = (position, duration) => {
    if (!position || !duration) return 0;
    return Math.min((position / duration) * 100, 100);
  };

  return (
    <div className="px-4 md:px-10 mb-8">
      <h2 className={`${isDark ? 'text-white' : 'text-black'} text-xl md:text-2xl font-bold mb-4`}>Continue Watching</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((movie) => (
          <div
            key={movie.movieId || movie.id}
            className="shrink-0 w-48 md:w-56 group cursor-pointer"
            onClick={() => handleMovieClick(movie)}
          >
            {/* Poster Image */}
            <div className="relative rounded-lg overflow-hidden bg-gray-800 h-72 md:h-80">
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex gap-2">
                  {/* Resume Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResume(movie);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 font-semibold transition-colors"
                  >
                    <span>▶</span>
                    Resume
                  </button>

                  {/* Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMovieClick(movie);
                    }}
                    className="bg-white/30 hover:bg-white/50 text-white px-4 py-2 rounded font-semibold transition-colors"
                  >
                    ℹ️
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                <div
                  className="h-full bg-red-600"
                  style={{
                    width: `${getProgressPercentage(
                      movie.position,
                      movie.runtime || 120
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Title */}
            <p className={`${isDark ? 'text-white' : 'text-black'} text-sm mt-2 font-semibold truncate`}>
              {movie.title}
            </p>

            {/* Progress Text */}
            {movie.position && movie.runtime && (
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs mt-1`}>`
                {Math.floor(movie.position / 60)}m / {Math.floor(movie.runtime / 60)}m
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Movie Modal */}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default ContinueWatchingRow;
