import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

function Navbar({ genres = [] }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout(); // Use the logout function from AuthContext
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignInClick = () => {
    navigate("/login"); // Use navigate for routing
  };

  return (
    <nav className={`fixed top-0 z-50 w-full flex justify-between items-center px-4 md:px-10 py-3 md:py-4 ${theme === 'dark' ? 'bg-black' : 'bg-white'} bg-opacity-90`}>
      <div className="flex items-center gap-4 md:space-x-8">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
          alt="Netflix Logo"
          className="h-6 md:h-8"
        />
        {user && (
          <div className="hidden md:flex space-x-4">
            <Link to="/" className={`hover:text-gray-300 text-sm md:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Home</Link>
            <Link to="/watchlist" className={`hover:text-gray-300 text-sm md:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>My Watchlist</Link>
            <Link to="/favorites" className={`hover:text-gray-300 text-sm md:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>❤️ Favorites</Link>
            <div className="relative group">
              <button className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-800 hover:text-gray-600'} focus:outline-none text-sm md:text-base`}>Genres</button>
              <div className={`absolute left-0 mt-2 w-40 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {genres?.map(genre => (
                  <Link
                    key={genre.id}
                    to={`/genre/${genre.id}`}
                    className={`block px-4 py-2 ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-200'}`}
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {user && (
        <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-gray-200 text-black placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`}
          />
          <button type="submit" className={`bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm`}>
            Search
          </button>
        </form>
      )}

      {user ? (
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-200'} p-2 rounded-full transition`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          {/* Mobile Search Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden ${theme === 'dark' ? 'text-white' : 'text-gray-800'} p-2`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'} hidden sm:block text-xs md:text-sm`}>
            {user.username}
          </span>
          <Link
            to="/profile"
            className={`${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-300 text-black hover:bg-gray-400'} px-2 md:px-4 py-1 rounded transition text-xs md:text-sm`}
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className={`${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-300 text-black hover:bg-gray-400'} px-2 md:px-4 py-1 rounded transition text-xs md:text-sm`}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button for non-logged in users */}
          <button
            onClick={toggleTheme}
            className={`${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-200'} p-2 rounded-full transition`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleSignInClick}
            className="bg-[#E50914] text-white px-3 md:px-4 py-1 rounded hover:bg-red-700 transition text-sm md:text-base"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div className={`absolute top-full left-0 w-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} p-4 md:hidden`}>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 px-3 py-2 rounded ${theme === 'dark' ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-gray-200 text-black placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Search
            </button>
          </form>
          <Link to="/" className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-800'} py-2 ${theme === 'dark' ? 'hover:text-gray-300' : 'hover:text-gray-600'}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/watchlist" className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-800'} py-2 ${theme === 'dark' ? 'hover:text-gray-300' : 'hover:text-gray-600'}`} onClick={() => setMobileMenuOpen(false)}>My Watchlist</Link>
          <Link to="/favorites" className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-800'} py-2 ${theme === 'dark' ? 'hover:text-gray-300' : 'hover:text-gray-600'}`} onClick={() => setMobileMenuOpen(false)}>❤️ Favorites</Link>
          <div className="py-2">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Genres:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {genres?.slice(0, 6).map(genre => (
                <Link
                  key={genre.id}
                  to={`/genre/${genre.id}`}
                  className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'} px-2 py-1 rounded text-xs`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;