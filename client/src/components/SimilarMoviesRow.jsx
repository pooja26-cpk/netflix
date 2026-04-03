import React, { useState } from "react";
import MovieModal from "./MovieModal";
import { useTheme } from "../hooks/useTheme";

function SimilarMoviesRow({ movies = [], title = "You Might Also Like" }) {
  const [selectedMovie, setSelectedMovie] = useState(null);
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

  return (
    <div className="px-4 md:px-10 mb-8">
      <h2 className={`${isDark ? 'text-white' : 'text-black'} text-xl md:text-2xl font-bold mb-4`}>{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="shrink-0 w-40 md:w-48 group cursor-pointer"
            onClick={() => handleMovieClick(movie)}
          >
            {/* Poster Image */}
            <div className="relative rounded-lg overflow-hidden bg-gray-800 h-60 md:h-72">
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={movie.title || movie.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay with Rating and Vote Count */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-white font-bold">
                      {movie.vote_average?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs">
                    {movie.vote_count || 0} votes
                  </p>
                </div>
              </div>

              {/* Genre Badge */}
              {movie.genre_ids && movie.genre_ids.length > 0 && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  {movie.genre_ids[0]}
                </div>
              )}
            </div>

            {/* Title */}
            <p className={`${isDark ? 'text-white' : 'text-black'} text-sm mt-2 font-semibold truncate`}>
              {movie.title || movie.name}
            </p>

            {/* Release Date */}
            {movie.release_date && (
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs mt-1`}>
                {new Date(movie.release_date).getFullYear()}
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

export default SimilarMoviesRow;
