import { useTheme } from "../hooks/useTheme";

function Banner({ movie, onPlay, onMovieClick }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!movie) return null;

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
  };

  // Helper to get the correct image URL
  const getBackdropUrl = (backdropPath) => {
    if (!backdropPath) return null;
    // If it's already a full URL, use it directly
    if (backdropPath.startsWith('http://') || backdropPath.startsWith('https://')) {
      return backdropPath;
    }
    // Otherwise, prepend the TMDB base URL
    return `https://image.tmdb.org/t/p/original${backdropPath}`;
  };

  const backdropUrl = getBackdropUrl(movie.backdrop_path);

  return (
    <header
      className={`relative h-[50vh] md:h-[70vh] lg:h-[85vh] flex items-end ${isDark ? 'text-white' : 'text-black'} px-4 md:px-10 pb-6 md:pb-10`}
      style={{
        backgroundSize: "cover",
        backgroundImage: backdropUrl ? `url(${backdropUrl})` : undefined,
        backgroundPosition: "center center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
      <div className="relative z-10 max-w-xl lg:max-w-2xl">
        <h1 className={`text-2xl md:text-5xl lg:text-6xl font-black mb-2 md:mb-4 drop-shadow-lg ${isDark ? 'text-white' : 'text-red-500'}`}>
          {movie.title || movie.name}
        </h1>
        <p className={`text-sm md:text-lg lg:text-xl max-w-lg md:max-xl mb-4 md:mb-6 drop-shadow-md hidden sm:block ${isDark ? 'text-white' : 'text-red-500'}`}>
          {truncate(movie.overview, 120)}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={() => onPlay(movie)}
            className="bg-white text-black px-6 py-2 md:py-3 rounded font-bold text-sm md:text-lg transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-200"
          >
            <span className="text-lg md:text-2xl">▶</span>
            <span>Play</span>
          </button>
          <button
            onClick={() => onMovieClick(movie)}
            className={`px-6 py-2 md:py-3 rounded font-bold text-sm md:text-lg transition-all duration-300 flex items-center justify-center gap-2 ${isDark ? 'bg-gray-600 bg-opacity-70 text-white hover:bg-gray-500' : 'bg-gray-300 text-black hover:bg-gray-400'}`}
          >
            <span>ℹ️</span>
            <span>More Info</span>
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-16 md:h-24 bg-gradient-to-t from-black to-transparent"></div>
    </header>
  );
}

export default Banner;
