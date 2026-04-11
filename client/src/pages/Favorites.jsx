import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import MovieModal from "../components/MovieModal";
import Footer from "../components/Footer";

const Favorites = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [favorites, setFavorites] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const base = import.meta.env.VITE_API_URL || "https://netflix-server-production-4cdc.up.railway.app/api";
        const response = await axios.get(`${base}/auth/favorites`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });

        // Fetch full movie details for each favorite
        const detailedFavorites = await Promise.all(
          response.data.map(async (item) => {
            try {
              const [detailResponse, videosResponse] = await Promise.all([
                axios.get(`${base}/movie/${item.movieId}`),
                axios.get(`${base}/movie/${item.movieId}/videos`),
              ]);

              return {
                ...item,
                ...detailResponse.data,
                videos: videosResponse.data,
              };
            } catch {
              console.warn(`Could not fetch details for movie ${item.movieId}`);
              return item;
            }
          })
        );

        setFavorites(detailedFavorites);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handleRemoveFromFavorites = (movieId) => {
    setFavorites(favorites.filter((movie) => movie.movieId !== movieId));
    setSelectedMovie(null);
  };

  return (
    <div className={`${isDark ? 'bg-black' : 'bg-gray-100'} min-h-screen pt-20`}>
      <Navbar />
      <div className="px-4 md:px-10 py-8">
        <h1 className={`${isDark ? 'text-white' : 'text-black'} text-3xl md:text-4xl font-bold mb-8`}>
          ❤️ My Favorites
        </h1>

        {loading ? (
          <div className={`${isDark ? 'text-white' : 'text-black'} text-center py-20`}>
            <p className="text-lg">Loading your favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center py-20`}>
            <p className="text-lg mb-4">No favorite movies yet.</p>
            <p>Start adding movies to your favorites to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
            {favorites.map((movie) => (
              <MovieCard
                key={movie.movieId || movie.id}
                movie={movie}
                onMovieClick={handleMovieClick}
                isFavorite={true}
              />
            ))}
          </div>
        )}
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={handleCloseModal}
          onRemoveFromFavorites={handleRemoveFromFavorites}
        />
      )}

      <Footer />
    </div>
  );
};

export default Favorites;
