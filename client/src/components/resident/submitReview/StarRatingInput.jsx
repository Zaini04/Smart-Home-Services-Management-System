// submitReview/StarRatingInput.jsx
import React from "react";
import { FaStar } from "react-icons/fa";

const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"];

function StarRatingInput({ rating, setRating, hoverRating, setHoverRating }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">How was the service?</h3>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <FaStar
              className={`w-10 h-10 transition-colors ${
                star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-gray-500 mt-2">{ratingLabels[rating] || "Tap to rate"}</p>
    </div>
  );
}

export default StarRatingInput;

