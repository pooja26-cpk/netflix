import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Row from "../components/Row";
import MovieModal from "../components/MovieModal";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";

function Genre() {
  const { genreId } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { info } = useToast();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [genreName, setGenreName] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || "https://netflix-server-production-4cdc.up.railway.app/api";
        const res = await axios.get(`${base}/genres`);
        setGenres(res.data.genres || []);
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchGenreMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch movies for the genre
        const base = import.meta.env.VITE_API_URL || "https://netflix-server-production-4cdc.up.railway.app/api";
        const moviesUrl = `${base}/genre/${genreId}`;
        console.log(`Fetching movies for genre ${genreId} from: ${moviesUrl}`);
        
        const moviesRes = await axios.get(moviesUrl);
        setMovies(moviesRes.data.results || []);
        
        // Try to get genre name from the API or use a mapping
        const genreNames = {
          28: "Action",
          12: "Adventure",
          16: "Animation",
          35: "Comedy",
          80: "Crime",
          99: "Documentary",
          18: "Drama",
          10751: "Family",
          14: "Fantasy",
          36: "History",
          27: "Horror",
          10402: "Music",
          9648: "Mystery",
          10749: "Romance",
          878: "Science Fiction",
          10770: "TV Movie",
          53: "Thriller",
          10752: "War",
          37: "Western",
        };
        
        setGenreName(genreNames[genreId] || `Genre ${genreId}`);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching genre movies:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (genreId) {
      fetchGenreMovies();
    }
  }, [genreId]);

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handlePlay = (movie) => {
    const videoUrl = movie.videos?.results?.find(v => v.type === 'Trailer' || v.type === 'Teaser')?.key;
    if (videoUrl) {
      window.open(`https://www.youtube.com/watch?v=${videoUrl}`, '_blank');
    } else {
      info("No trailer available for this movie");
    }
  };

  return (
    <div className={`${isDark ? 'bg-black' : 'bg-gray-100'} min-h-screen`}>
      <Navbar genres={genres} />
      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-6 md:mb-8`}>{genreName}</h1>

        {loading && (
          <div className={`${isDark ? 'text-white' : 'text-black'} text-center py-20`}>
            <p>Loading movies...</p>
          </div>
        )}

        {error && (
          <div className={`${isDark ? 'bg-red-900 text-white' : 'bg-red-100 text-red-900'} p-4 rounded mb-4`}>
            <p>Error: {error}</p>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <Row 
            title={genreName}
            movies={movies}
            onMovieClick={setSelectedMovie}
          />
        )}

        {!loading && movies.length === 0 && !error && (
          <div className={`${isDark ? 'text-white' : 'text-black'} text-center py-20`}>
            <p>No movies found in this genre.</p>
          </div>
        )}
      </div>

      <MovieModal 
        movie={selectedMovie} 
        onClose={handleCloseModal} 
        onPlay={handlePlay}
      />
    </div>
  );
}

export default Genre;
