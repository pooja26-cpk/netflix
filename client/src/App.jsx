import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import NetflixIntro from "./components/NetflixIntro";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Watchlist from "./pages/Watchlist";
import Favorites from "./pages/Favorites";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";
import Genre from "./pages/Genre";
import Browse from "./pages/Browse";
import Home from "./pages/Home";
import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { ToastProvider } from "./context/ToastContext";

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <ToastProvider>
      {showIntro && <NetflixIntro onComplete={handleIntroComplete} />}
      {!showIntro && (
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/genre/:genreId"
            element={
              <ProtectedRoute>
                <Genre />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse"
            element={
              <ProtectedRoute>
                <Browse />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </ToastProvider>
  );
}

export default App;