import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setMessage("");
    setError("");
    try {
      const data = await resetPassword(token, { password });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Reset Password
          </button>
        </form>
        {message && (
          <div className="text-green-500 space-y-2">
            <p>{message}</p>
            <p>Redirecting to login...</p>
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!message && (
          <div className="text-center">
            <Link to="/login" className="text-gray-400 hover:text-white">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
