import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import Row from "../components/Row";
import ContinueWatchingRow from "../components/ContinueWatchingRow";
import requests from "../api/requests";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import axios from "axios";
import MovieModal from "../components/MovieModal";
import VideoPlayer from "../components/VideoPlayer";
import Footer from "../components/Footer";
import { useToast } from "../hooks/useToast";

function Home() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { info } = useToast();
  const [continueWatching, setContinueWatching] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playVideo, setPlayVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [trendingMovie, setTrendingMovie] = useState(null);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || "https://netflix-server-production-4cdc.up.railway.app/api";
        const response = await axios.get(`${base}/genres`);
        setGenres(response.data.genres || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);
  

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "https://netflix-server-production-4cdc.up.railway.app/api";
        const response = await axios.get(`${baseUrl}/trending`);
        if (response.data.results && response.data.results.length > 0) {
          const movieId = response.data.results[0].id;
          // Fetch movie details and videos in parallel
          const [detailsResponse, videosResponse] = await Promise.all([
            axios.get(`${baseUrl}/movie/${movieId}`),
            axios.get(`${baseUrl}/movie/${movieId}/videos`)
          ]);
          // Combine details with videos
          const movieWithVideos = {
            ...detailsResponse.data,
            videos: videosResponse.data
          };
          setTrendingMovie(movieWithVideos);
        }
      } catch (error) {
        console.error("Error fetching trending movie:", error);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setContinueWatching([]);
        return;
      }

      // Fetch watch history
      try {
        const base = import.meta.env.VITE_API_URL || "https://netflix-server-production-4cdc.up.railway.app/api";
        const historyResponse = await axios.get(`${base}/auth/watch-history`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        const historyData = historyResponse.data || [];
        const movieDetailsPromises = historyData.map(async (item) => {
          try {
            const response = await axios.get(
              `${base}/movie/${item.movieId}`
            );
            return { ...item, ...response.data };
          } catch (detailError) {
            console.error(
              `Error fetching details for movie ${item.movieId}`,
              detailError
            );
            return null;
          }
        });
        const watchHistoryWithDetails = (
          await Promise.all(movieDetailsPromises)
        ).filter(Boolean);
        const sortedHistory = watchHistoryWithDetails
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 20);
        setContinueWatching(sortedHistory);
      } catch (error) {
        console.error("Error fetching watch history:", error);
        setContinueWatching([]);
      }

      // Fetch watchlist
      try {
        const base = import.meta.env.VITE_API_URL || "https://netflix-clone-server-r4rh.onrender.com/api";
        const response = await axios.get(`${base}/auth/watchlist`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        const detailedWatchlist = await Promise.all(
          response.data.map(async (item) => {
            try {
              const detailResponse = await axios.get(
                `${base}/movie/${item.movieId}`
              );
              return { ...item, ...detailResponse.data };
            } catch {
              return item;
            }
          })
        );
        setWatchlist(detailedWatchlist);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      }
    };

    fetchUserData();
  }, [user]);

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
        movieId: movie.id || movie.movieId,
        position: movie.position || 0,
      });
      setSelectedMovie(null);
    } else {
      info("No trailer available for this movie");
    }
  };

  const handleVideoEnd = () => {
    setPlayVideo(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleAddToList = (movie) => {
    setWatchlist([movie, ...watchlist]);
  };

  const handleRemoveFromList = (movieId) => {
    setWatchlist(watchlist.filter((m) => m.id !== movieId));
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
    <div className={`homeScreen ${isDark ? 'bg-black' : 'bg-gray-100'}`}>
      <Navbar genres={genres} />
      <form
        onSubmit={handleSearch}
        className={`flex justify-center py-4 ${isDark ? 'bg-gray-900' : 'bg-gray-200'}`}
      >
        <div className={`flex items-center rounded-full px-4 py-2 w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <svg
            className={`w-5 h-5 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`bg-transparent w-full outline-none ${isDark ? 'text-white placeholder-gray-400' : 'text-black placeholder-gray-600'}`}
          />
          <button type="submit" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>
      {trendingMovie && (
        <Banner
          movie={trendingMovie}
          onMovieClick={handleMovieClick}
          onPlay={handlePlay}
        />
      )}
      {continueWatching.length > 0 && (
        <ContinueWatchingRow movies={continueWatching} />
      )}
      {user && watchlist.length > 0 && (
        <Row
          title="My Watchlist"
          movies={watchlist}
          onMovieClick={handleMovieClick}
          isWatchlist={true}
          setWatchlist={setWatchlist}
        />
      )}
      {user && (
        <Row
          title="Recommended for You"
          fetchUrl={requests.recommendations}
          onMovieClick={handleMovieClick}
          watchlist={watchlist}
          setWatchlist={setWatchlist}
        />
      )}
      {user && (
        <Row
          title="🇱🇰 Tamil Movies For You"
          fetchUrl={requests.tamilRecommendations}
          onMovieClick={handleMovieClick}
          watchlist={watchlist}
          setWatchlist={setWatchlist}
        />
      )}
      <Row
        title="Trending TV Shows"
        fetchUrl={requests.tvTrending}
        onMovieClick={handleMovieClick}
        isTV
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      <Row
        title="Popular TV Shows"
        fetchUrl={requests.tvPopular}
        onMovieClick={handleMovieClick}
        isTV
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      <Row
        title="Top Rated TV Shows"
        fetchUrl={requests.tvTopRated}
        onMovieClick={handleMovieClick}
        isTV
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      <Row
        title="NETFLIX ORIGINALS"
        fetchUrl={requests.fetchNetflixOriginals}
        onMovieClick={handleMovieClick}
        isLargeRow
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      <Row
        title="Trending Now"
        fetchUrl={requests.trending}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      
      {/* Tamil Movies Section */}
      <Row
        title=" Trending Tamil Movies"
        fetchUrl={requests.tamilTrending}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      <Row
        title="Popular Tamil Movies"
        fetchUrl={requests.tamilPopular}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      
      {/* Bollywood/Hindi Movies */}
      <Row
        title=" Bollywood Hits"
        fetchUrl={requests.hindiTrending}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      
      {/* Telugu Movies */}
      <Row
        title="Telugu Trending"
        fetchUrl={requests.teluguTrending}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      
      {/* Malayalam Movies */}
      <Row
        title="Malayalam Movies"
        fetchUrl={requests.malayalamTrending}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      
      {/* Korean Movies */}
      <Row
        title="🇰🇷 Korean Movies"
        fetchUrl={requests.koreanTrending}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      
      {/* Japanese Movies */}
      <Row
        title="🇯🇵 Japanese Movies"
        fetchUrl={requests.japaneseTrending}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      
      {/* Chinese Movies */}
      <Row
        title="🇨🇳 Chinese Movies"
        fetchUrl={requests.chineseTrending}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      
      <Row
        title="Top Rated"
        fetchUrl={requests.topRated}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      <Row
        title="Action Movies"
        fetchUrl={requests.fetchActionMovies}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      <Row
        title="Comedy Movies"
        fetchUrl={requests.fetchComedyMovies}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      <Row
        title="Horror Movies"
        fetchUrl={requests.fetchHorrorMovies}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      <Row
        title="Romance Movies"
        fetchUrl={requests.fetchRomanceMovies}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
      <Row
        title="Documentaries"
        fetchUrl={requests.fetchDocumentaries}
        onMovieClick={handleMovieClick}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />

      <Footer />

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={handleCloseModal}
          onAddToList={handleAddToList}
          onRemoveFromWatchlist={handleRemoveFromList}
        />
      )}
    </div>
  );
}

export default Home;
