import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import StarRating from './StarRating';

function ReviewSection({ movieId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://netflix-server-production-4cdc.up.railway.app/api'}/reviews/${movieId}`);
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [movieId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user || !user.accessToken) {
      setMessage("Please log in to submit a review.");
      setMessageType("error");
      return;
    }
    if (rating === 0) {
      setMessage("Please select a star rating.");
      setMessageType("error");
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'https://netflix-server-production-4cdc.up.railway.app/api'}/reviews`,
        { movieId, rating, comment },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      
      // Check if user already had a review
      const existingReviewIndex = reviews.findIndex(r => 
        (r.user._id === user.id) || (r.user === user.id)
      );
      
      if (existingReviewIndex !== -1) {
        // Update the existing review in the list
        const updatedReviews = [...reviews];
        updatedReviews[existingReviewIndex] = response.data;
        setReviews(updatedReviews);
        setMessage("You've already submitted a review. It has been updated!");
      } else {
        setReviews([response.data, ...reviews]);
        setMessage("Thank you for your review!");
      }
      setMessageType("success");
      setRating(0);
      setComment('');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      console.error("Error submitting review:", error);
      // Show more specific error message
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;
        console.error("Server error:", status, data);
        setMessage(data?.message || `Server error: ${status}`);
      } else if (error.request) {
        // No response received
        console.error("No response from server");
        setMessage("Cannot connect to server. Please check if the server is running.");
      } else {
        setMessage("Failed to submit review. Please try again.");
      }
      setMessageType("error");
    }
  };

  return (
    <div className="mt-4 md:mt-6">
      <h3 className={`text-lg md:text-2xl font-semibold mb-3 md:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Reviews</h3>
      {user && (
        <form onSubmit={handleSubmitReview} className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
          {message && (
            <div className={`mb-3 p-2 rounded text-sm ${
              messageType === 'success' 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}>
              {message}
            </div>
          )}
          <div className="mb-2 md:mb-3">
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className={`w-full p-2 md:p-3 rounded text-sm md:text-base ${isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-black placeholder-gray-500'}`}
            rows={3}
          ></textarea>
          <button type="submit" className="mt-2 md:mt-3 px-4 md:px-6 py-1.5 md:py-2 bg-red-600 rounded hover:bg-red-700 text-white text-sm md:text-base font-semibold">
            Submit Review
          </button>
        </form>
      )}
      <div className="space-y-3 md:space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className={`p-3 md:p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <div className={`font-semibold text-sm md:text-base ${isDark ? 'text-white' : 'text-black'}`}>{review.user.username}</div>
              <div className="text-yellow-400 text-sm md:text-base">{'★'.repeat(review.rating)}</div>
            </div>
            <p className={`text-sm md:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{review.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm md:text-base`}>No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}

export default ReviewSection;
