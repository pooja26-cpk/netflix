import React, { useState, useEffect } from "react";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "../api/auth";
import requests from "../api/requests";
import { useTheme } from "../hooks/useTheme";

// Helper to get the correct image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already a full URL (from OMDB or sample data), use it directly
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, prepend the TMDB base URL
  return `https://image.tmdb.org/t/p/w1280${imagePath}`;
};

function Modal({ movie, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [trailerKey, setTrailerKey] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);
  const [movieCredits, setMovieCredits] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchMovieDetailsAndCredits = async () => {
      if (movie) {
        try {
          // Fetch movie videos (trailer)
          const videosRes = await fetch(requests.movieDetails(movie.id) + "/videos");
          const videosData = await videosRes.json();
          const trailer = videosData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
          if (trailer) setTrailerKey(trailer.key);

          // Fetch full movie details
          const detailsRes = await fetch(requests.movieDetails(movie.id));
          const detailsData = await detailsRes.json();
          setMovieDetails(detailsData);

          // Fetch movie credits
          const creditsRes = await fetch(requests.movieCredits(movie.id));
          const creditsData = await creditsRes.json();
          setMovieCredits(creditsData);

          // Check if in watchlist
          const watchlist = await getWatchlist();
          setInWatchlist(watchlist.some(item => item.movieId === movie.id));
        } catch (err) {
          console.error('Error fetching movie data for modal:', err);
        }
      }
    };
    fetchMovieDetailsAndCredits();
  }, [movie]);

  const handleWatchlist = async () => {
    if (!movieDetails) return; // Ensure movieDetails is available

    try {
        if (inWatchlist) {
            await removeFromWatchlist(movie.id);
            setInWatchlist(false);
        } else {
            await addToWatchlist(movie.id, movieDetails.title || movieDetails.name, movieDetails.poster_path);
            setInWatchlist(true);
        }
    } catch (error) {
        console.error("Error updating watchlist:", error);
    }
  };

  if (!movie || !movieDetails) return null; // Render only when movie and details are available

  const releaseYear = movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : movieDetails.first_air_date ? new Date(movieDetails.first_air_date).getFullYear() : 'N/A';
  const rating = movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A';
  const genres = movieDetails.genres ? movieDetails.genres.map(g => g.name).join(', ') : 'N/A';
  const runtime = movieDetails.runtime ? `${movieDetails.runtime} min` : 'N/A';
  const cast = movieCredits && movieCredits.cast ? movieCredits.cast.slice(0, 5).map(c => c.name).join(', ') : 'N/A';


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl my-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={`absolute top-3 right-3 md:top-4 md:right-4 ${isDark ? 'text-white' : 'text-gray-900'} text-xl md:text-2xl font-bold z-10 hover:bg-gray-200 transition bg-black/30 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center`}
          onClick={onClose}
        >
          &times;
        </button>
        <div className="relative">
          <img
            src={getImageUrl(movieDetails.backdrop_path)}
            alt={movieDetails.title || movieDetails.name}
            className="w-full h-48 md:h-80 object-cover rounded-t-lg"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-gray-900' : 'from-white'} via-transparent to-transparent rounded-t-lg`}></div>
          <div className="absolute bottom-3 left-4 right-4 md:bottom-4 md:left-6 md:right-6">
            <h2 className={`text-xl md:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{movieDetails.title || movieDetails.name}</h2>
            <div className={`flex flex-wrap items-center gap-2 md:gap-4 ${isDark ? 'text-white' : 'text-gray-700'} text-xs md:text-sm mb-3 md:mb-4`}>
              <span className="bg-green-600 px-2 py-1 rounded text-xs font-bold text-white">{rating} IMDb</span>
              <span>{releaseYear}</span>
              <span>{movieDetails.adult ? '18+' : 'All Ages'}</span>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <button 
                onClick={() => setShowTrailer(true)}
                className="bg-white text-black px-4 md:px-6 py-1.5 md:py-2 rounded font-semibold hover:bg-gray-200 transition flex items-center gap-2 text-sm md:text-base"
              >
                <span>▶</span>
                <span>Play</span>
              </button>
              <button onClick={handleWatchlist} className={`${isDark ? 'bg-gray-600 bg-opacity-80 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} px-3 md:px-4 py-1.5 md:py-2 rounded transition flex items-center gap-2 text-sm md:text-base`}>
                <span>{inWatchlist ? '✓' : '+'}</span>
                <span>{inWatchlist ? 'In My List' : 'My List'}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          {trailerKey && showTrailer && (
            <div className="mb-4 md:mb-6">
              <h3 className={`text-lg md:text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Trailer</h3>
              <div className="relative">
                <button
                  onClick={() => setShowTrailer(false)}
                  className={`absolute top-2 right-2 ${isDark ? 'text-white' : 'text-gray-900'} text-xl font-bold z-10 hover:bg-gray-200 transition bg-black/30 rounded-full w-8 h-8 flex items-center justify-center`}
                >
                  &times;
                </button>
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                    title="Movie Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
              </div>
            </div>
          )}
          <p className={`text-sm md:text-base leading-relaxed mb-4 ${isDark ? 'text-white' : 'text-gray-700'}`}>{movieDetails.overview}</p>
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <div>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Genres: </span>
              {genres}
            </div>
            <div>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Runtime: </span>
              {runtime}
            </div>
            <div className="sm:col-span-2">
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Starring: </span>
              {cast}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;