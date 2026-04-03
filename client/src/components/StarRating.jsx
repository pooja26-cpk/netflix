import React, { useState } from 'react';

function StarRating({ rating, onRatingChange }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className={`text-2xl ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-400'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default StarRating;