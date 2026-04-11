import { apiUrl } from "./baseUrl";

const API_URL = apiUrl("/auth");

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.accessToken;
  if (!token) {
    return { "Content-Type": "application/json" };
  }
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return !!user?.accessToken;
};

export const forgotPassword = async ({ email }) => {
    const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error("Failed to send password reset email");
    return response.json();
};

export const resetPassword = async (token, { password }) => {
    const response = await fetch(`${API_URL}/reset-password/${token}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ password }),
    });
    if (!response.ok) throw new Error("Failed to reset password");
    return response.json();
};

export const addToWatchlist = async (movieId, title, poster_path, isTV) => {
  const response = await fetch(`${API_URL}/watchlist`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ movieId, title, poster_path, isTV }),
  });
  if (!response.ok) throw new Error("Failed to add to watchlist");
  return response.json();
};

export const removeFromWatchlist = async (movieId) => {
  const response = await fetch(`${API_URL}/watchlist/${movieId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to remove from watchlist");
  return response.json();
};

export const getWatchlist = async () => {
  if (!isAuthenticated()) {
    return []; // Return empty array if not authenticated
  }
  const response = await fetch(`${API_URL}/watchlist`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    // If unauthorized, return empty array instead of throwing error
    if (response.status === 401) {
      return [];
    }
    throw new Error("Failed to fetch watchlist");
  }
  return response.json();
};

export const saveWatchHistory = async (movieId, position) => {
  const response = await fetch(`${API_URL}/watch-history`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ movieId, position }),
  });
  if (!response.ok) throw new Error("Failed to save watch history");
  return response.json();
};

export const getWatchHistory = async () => {
  if (!isAuthenticated()) {
    return []; // Return empty array if not authenticated
  }
  const response = await fetch(`${API_URL}/watch-history`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    // If unauthorized, return empty array instead of throwing error
    if (response.status === 401) {
      return [];
    }
    throw new Error("Failed to fetch watch history");
  }
  return response.json();
};
