import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import MovieModal from "../components/MovieModal";
import SimilarMoviesRow from "../components/SimilarMoviesRow";

export default function Watch() {
  const location = useLocation();
  const { movie } = location.state || {};
  const [similarMovies, setSimilarMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      if (!movie?.id) return;
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "https://netflix-server-production-4cdc.up.railway.app/api";
        const response = await axios.get(`${baseUrl}/movie/${movie.id}/similar`);
        if (response.data.results) {
          setSimilarMovies(response.data.results.slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching similar movies:", error);
      }
    };
    fetchSimilarMovies();
  }, [movie?.id]);

  if (!movie) {
    return (
      <div className="w-screen h-screen bg-black text-white flex items-center justify-center">
        Movie not found.
      </div>
    );
  }

  const trailer = movie.videos?.results?.find(
    (video) => video.type === "Trailer"
  );

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="w-screen h-screen bg-black relative">
      <Link to="/">
        <div className="absolute top-4 left-4 z-50 flex items-center cursor-pointer bg-black/50 px-3 py-2 rounded-full">
          <span className="text-white text-xl mr-2">←</span>
          <span className="text-white">Back to Home</span>
        </div>
      </Link>
      {trailer ? (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&controls=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white">
          <p className="text-2xl">Trailer not available for this movie.</p>
        </div>
      )}

      <div className="bg-black min-h-screen">
        {similarMovies.length > 0 && (
          <SimilarMoviesRow movies={similarMovies} title="You Might Also Like" />
        )}
      </div>
      
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={handleCloseModal}
          onMovieClick={handleMovieClick}
        />
      )}
    </div>
  );
}
