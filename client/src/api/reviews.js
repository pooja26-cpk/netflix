import { apiUrl } from "./baseUrl";

const API_URL = apiUrl("/reviews");

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.accessToken;
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

export const getReviews = async (movieId) => {
  const response = await fetch(`${API_URL}/${movieId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch reviews");
  return response.json();
};

export const addReview = async (movieId, rating, comment) => {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ movie: movieId, rating, comment }),
  });
  if (!response.ok) throw new Error("Failed to add review");
  return response.json();
};
