import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import MovieCard from "../components/MovieCard";
import MovieModal from "../components/MovieModal";
import VideoPlayer from "../components/VideoPlayer";
import Footer from "../components/Footer";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";

const BASE_URL = import.meta.env.VITE_API_URL || "https://netflix-clone-server-r4rh.onrender.com/api";

// Language options for filter
const LANGUAGES = [
  { code: "", name: "All Languages" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "hi", name: "Hindi" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
];

const Browse = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { info } = useToast();
  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playVideo, setPlayVideo] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const location = useLocation();
  
  // Get query from URL
  const queryParam = new URLSearchParams(location.search).get("query");
  
  // Local state
  const [loading, setLoading] = useState(true);
  const [trendingMovie, setTrendingMovie] = useState(null);
  
  // Filter states
  const [actorSearch, setActorSearch] = useState("");
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorResults, setActorResults] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/genres`);
        setGenres(response.data.genres || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !user.accessToken) {
        setFavorites([]);
        return;
      }
      try {
        const response = await axios.get(`${BASE_URL}/auth/favorites`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        setFavorites(response.data || []);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setFavorites([]);
      }
    };
    fetchFavorites();
  }, [user]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/trending`);
        if (response.data.results && response.data.results.length > 0) {
          const movieId = response.data.results[0].id;
          const [detailsResponse, videosResponse] = await Promise.all([
            axios.get(`${BASE_URL}/movie/${movieId}`),
            axios.get(`${BASE_URL}/movie/${movieId}/videos`)
          ]);
          setTrendingMovie({
            ...detailsResponse.data,
            videos: videosResponse.data
          });
        }
      } catch (error) {
        console.error("Error fetching trending movie:", error);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        let url = "";
        
        // Search takes priority
        if (queryParam) {
          url = `${BASE_URL}/search?query=${encodeURIComponent(queryParam)}&page=1&include_adult=false`;
        } 
        // Default: Tamil trending
        else {
          url = `${BASE_URL}/trending-by-language?language=ta`;
        }
        
        console.log('Fetching:', url);
        
        const response = await axios.get(url);
        let moviesData = response.data.results || [];
        
        console.log('Movies:', moviesData.length);
        
        // Get full details
        const detailedResults = await Promise.all(
          moviesData.slice(0, 18).map(async (movie) => {
            try {
              const detailResponse = await axios.get(`${BASE_URL}/movie/${movie.id}`);
              return detailResponse.data;
            } catch {
              return movie;
            }
          })
        );
        
        setResults(detailedResults);
      } catch (error) {
        console.error("Error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [queryParam]);

  // Debounced actor search
  useEffect(() => {
    if (!actorSearch || actorSearch.length < 2) {
      setActorResults([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(`${BASE_URL}/search-person?query=${encodeURIComponent(actorSearch)}`);
        setActorResults(response.data.results?.slice(0, 5) || []);
      } catch (error) {
        console.error("Actor search error:", error);
        setActorResults([]);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [actorSearch]);

  // Apply filters
  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedActor) params.append('actor_id', selectedActor.id);
      if (selectedLanguage) params.append('language', selectedLanguage);
      
      const url = `${BASE_URL}/filter?${params.toString()}`;
      const response = await axios.get(url);
      
      const detailedResults = await Promise.all(
        (response.data.results || []).slice(0, 18).map(async (movie) => {
          try {
            const detailResponse = await axios.get(`${BASE_URL}/movie/${movie.id}`);
            return detailResponse.data;
          } catch {
            return movie;
          }
        })
      );
      
      setResults(detailedResults);
    } catch (error) {
      console.error("Filter error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActorSelect = (actor) => {
    setSelectedActor(actor);
    setActorSearch(actor.name);
    setActorResults([]);
  };

  const clearFilters = () => {
    setSelectedActor(null);
    setActorSearch("");
    setSelectedLanguage("");
    setActorResults([]);
    // Refetch default content
    const fetchResults = async () => {
      setLoading(true);
      try {
        const url = `${BASE_URL}/trending-by-language?language=ta`;
        const response = await axios.get(url);
        const moviesData = response.data.results || [];
        const detailedResults = await Promise.all(
          moviesData.slice(0, 18).map(async (movie) => {
            try {
              const detailResponse = await axios.get(`${BASE_URL}/movie/${movie.id}`);
              return detailResponse.data;
            } catch {
              return movie;
            }
          })
        );
        setResults(detailedResults);
      } catch (error) {
        console.error("Error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handlePlay = (movie) => {
    const videoUrl = movie.videos?.results?.find(
      (v) => v.type === "Trailer" || v.type === "Teaser"
    )?.key;
    if (videoUrl) {
      setPlayVideo({
        url: `https://www.youtube.com/watch?v=${videoUrl}`,
        movieId: movie.id,
        position: 0,
      });
      setSelectedMovie(null);
    } else {
      info("No trailer available for this movie");
    }
  };

  const handleVideoEnd = () => {
    setPlayVideo(null);
  };

  if (playVideo) {
    return (
      <VideoPlayer
        videoUrl={playVideo.url}
        movieId={playVideo.movieId}
        initialPosition={playVideo.position}
        onEnded={handleVideoEnd}
      />
    );
  }

  return (
    <div className={`pt-16 md:pt-17 ${isDark ? 'text-white bg-black' : 'text-black bg-gray-100'} min-h-screen`}>
      <Navbar genres={genres} />
      {trendingMovie && !queryParam && (
        <Banner
          movie={trendingMovie}
          onPlay={handlePlay}
          onMovieClick={handleMovieClick}
        />
      )}
      <div className="p-3 md:p-5">
        {/* Search info */}
        {queryParam && (
          <h2 className={`text-xl mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            Search results for: <span className={`${isDark ? 'text-white' : 'text-black'} font-bold`}>"{queryParam}"</span>
          </h2>
        )}

        {/* Filter Toggle Button */}
        <div className="mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-white hover:bg-gray-100 text-black'
            } border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
            <div className="flex flex-wrap gap-4 items-end">
              {/* Actor Search */}
              <div className="flex-1 min-w-[200px]">
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Actor Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={actorSearch}
                    onChange={(e) => setActorSearch(e.target.value)}
                    placeholder="Search for an actor..."
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {/* Actor suggestions dropdown */}
                  {actorResults.length > 0 && (
                    <div className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg overflow-hidden ${
                      isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-300'
                    }`}>
                      {actorResults.map((actor) => (
                        <button
                          key={actor.id}
                          onClick={() => handleActorSelect(actor)}
                          className={`w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-red-500 hover:text-white transition-colors ${
                            isDark ? 'text-white' : 'text-black'
                          }`}
                        >
                          {actor.profile_path && (
                            <img 
                              src={`https://image.tmdb.org/t/p/w45${actor.profile_path}`} 
                              alt={actor.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{actor.name}</div>
                            {actor.known_for_department === 'Acting' && (
                              <div className="text-xs opacity-75">{actor.known_for?.slice(0, 2).map(m => m.title || m.name).join(', ')}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Language Filter */}
              <div className="min-w-[150px]">
                <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300 text-black'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Apply & Clear Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Apply Filters
                </button>
                {(selectedActor || selectedLanguage) && (
                  <button
                    onClick={clearFilters}
                    className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-black'
                    }`}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Active filters display */}
            {(selectedActor || selectedLanguage) && (
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active filters: </span>
                {selectedActor && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600/20 text-red-500 rounded-full text-sm mr-2">
                    Actor: {selectedActor.name}
                  </span>
                )}
                {selectedLanguage && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-500 rounded-full text-sm">
                    Language: {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((movie) => {
              const isMovieFavorite = favorites.some(
                (fav) => Number(fav.movieId) === Number(movie.id)
              );
              return (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onMovieClick={handleMovieClick}
                  isFavorite={isMovieFavorite}
                />
              );
            })}
          </div>
        )}
        
        {!loading && results.length === 0 && (
          <div className="text-center py-16">
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg`}>No movies found</p>
            <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>Try searching for a different movie name</p>
          </div>
        )}
      </div>

      {selectedMovie && <MovieModal movie={selectedMovie} onClose={handleCloseModal} />}
      <Footer />
    </div>
  );
};

export default Browse;
