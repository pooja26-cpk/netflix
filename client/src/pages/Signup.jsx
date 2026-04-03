import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create an account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      <img
        src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1920&h=1080&fit=crop"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
          alt="Netflix Logo"
          className="h-8 md:h-10"
        />
      </div>
      <div className="relative z-10 p-6 md:p-10 bg-black bg-opacity-75 rounded shadow-lg max-w-sm md:max-w-md w-full mx-4">
        <h1 className="text-white text-2xl md:text-3xl font-bold mb-6 text-center">Sign Up</h1>
        {error && <p className="text-red-500 text-center mb-4 text-sm md:text-base">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 my-2 bg-gray-800 text-white rounded outline-none focus:ring-2 focus:ring-red-600 text-sm md:text-base"
            autoComplete="username"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 my-2 bg-gray-800 text-white rounded outline-none focus:ring-2 focus:ring-red-600 text-sm md:text-base"
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 my-2 bg-gray-800 text-white rounded outline-none focus:ring-2 focus:ring-red-600 text-sm md:text-base"
            autoComplete="new-password"
            required
          />
          <button
            type="submit"
            className="p-3 my-4 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition duration-200 text-sm md:text-base"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-white text-center mt-4 text-sm md:text-base">
          Already have an account?{' '}
          <Link to="/login" className="text-red-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
