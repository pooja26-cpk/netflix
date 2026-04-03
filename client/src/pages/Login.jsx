import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { useToast } from "../hooks/useToast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1516738901601-b53f3cc57c48?w=1920&h=1080&fit=crop')"
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
          alt="Netflix Logo"
          className="h-8 md:h-10"
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="relative bg-black bg-opacity-80 p-6 md:p-8 rounded-lg w-full max-w-sm md:max-w-md border border-gray-700 shadow-2xl mx-4"
      >
        <h1 className="text-2xl md:text-3xl text-white mb-6 md:mb-8 font-semibold">Sign In</h1>

        <input
          type="email"
          placeholder="Email or phone number"
          className="w-full p-3 md:p-4 mb-3 md:mb-4 bg-gray-800 text-white rounded border border-gray-600 focus:border-white focus:outline-none transition text-sm md:text-base"
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 md:p-4 mb-4 md:mb-6 bg-gray-800 text-white rounded border border-gray-600 focus:border-white focus:outline-none transition text-sm md:text-base"
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" className="w-full bg-[#E50914] py-2.5 md:py-3 text-white font-semibold rounded hover:bg-red-700 transition mb-4 text-sm md:text-base">
          Sign In
        </button>
        <div className="text-center">
          <Link to="/forgot-password" className="text-gray-400 hover:text-white text-xs md:text-sm">Forgot password?</Link>
        </div>
        <div className="mt-5 md:mt-6 text-gray-400 text-xs md:text-sm">
          New to Netflix? <Link to="/signup" className="text-white hover:underline">Sign up now</Link>.
        </div>
      </form>
    </div>
  );
}

export default Login;
