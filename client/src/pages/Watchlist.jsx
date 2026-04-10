import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import MovieModal from "../components/MovieModal";
import Footer from "../components/Footer";

const Watchlist = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [watchlist, setWatchlist] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const base = import.meta.env.VITE_API_URL || "https://netflix-server-production-4cdc.up.railway.app/api";
        const response = await axios.get(`${base}/auth/watchlist`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });

        // Fetch full movie details and videos for each item in the watchlist
        const detailedWatchlist = await Promise.all(
          response.data.map(async (item) => {
            try {
              const [detailResponse, videosResponse] = await Promise.all([
                axios.get(`${base}/movie/${item.movieId}`),
                axios.get(`${base}/movie/${item.movieId}/videos`)
              ]);
              
              // Check if movie has trailer
              const hasTrailer = videosResponse.data.results?.some(
                (v) => v.type === "Trailer" || v.type === "Teaser"
              );
              
              return { 
                ...item, 
                ...detailResponse.data,
                videos: videosResponse.data,
                hasTrailer 
              };
            } catch {
              console.warn(
                `Could not fetch details for movie ${item.movieId}`
              );
              return item; // Fallback to original item
            }
          })
        );
        
        // Filter to only show movies with trailers
        const moviesWithTrailers = detailedWatchlist.filter(movie => movie.hasTrailer);
        setWatchlist(moviesWithTrailers);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user]);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handleRemoveFromWatchlist = (movieId) => {
    setWatchlist(watchlist.filter(movie => movie.movieId !== movieId));
    setSelectedMovie(null); // Close modal after removing
  };

  const handleMovieRemove = (movieId) => {
    setWatchlist(watchlist.filter(movie => movie.movieId !== movieId));
  };

  return (
    <div className={`pt-20 ${isDark ? 'text-white bg-black' : 'text-black bg-gray-100'} min-h-screen`}>
      <Navbar />
      <div className="p-4 md:p-8">
        <h1 className={`text-2xl md:text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>My Watchlist</h1>
        {loading ? (
          <div className={`text-center ${isDark ? 'text-white' : 'text-black'}`}>Loading...</div>
        ) : watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlist.map((movie) => (
              <MovieCard
                key={movie.movieId}
                movie={movie}
                onMovieClick={handleMovieClick}
                showRemove={true}
                onRemove={handleMovieRemove}
              />
            ))}
          </div>
        ) : (
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Your watchlist is empty. Add movies to see them here.
          </p>
        )}
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={handleCloseModal}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
        />
      )}

      <Footer />
    </div>
  );
};

export default Watchlist;
