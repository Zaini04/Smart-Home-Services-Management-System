import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaStar,
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaUser,
  FaThumbsUp,
  FaThumbsDown,
} from "react-icons/fa";
import { getBookingDetails, submitReview } from "../../api/residentsEndpoints";

export default function SubmitReview() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Review Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [workQuality, setWorkQuality] = useState("");
  const [wasPolite, setWasPolite] = useState(null);
  const [arrivedOnTime, setArrivedOnTime] = useState(null);
  const [priceWasFair, setPriceWasFair] = useState(null);
  const [wouldHireAgain, setWouldHireAgain] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchBooking();
  }, [bookingId, user]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await getBookingDetails(bookingId);
      const bookingData = res.data.data.booking;

      // Check if can review
      if (bookingData.status !== "completed") {
        setError("Can only review completed bookings");
      } else if (bookingData.isReviewed) {
        setError("You have already reviewed this booking");
      }

      setBooking(bookingData);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await submitReview(bookingId, {
        rating,
        review,
        workQuality,
        wasPolite,
        arrivedOnTime,
        priceWasFair,
        wouldHireAgain,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/my-bookings");
      }, 2000);
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <FaSpinner className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You! 🎉</h2>
            <p className="text-gray-600 mb-4">
              Your review has been submitted successfully.
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <FaSpinner className="animate-spin" />
              <span>Redirecting...</span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !booking) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{error}</h2>
            <button
              onClick={() => navigate("/my-bookings")}
              className="text-blue-600 hover:underline"
            >
              Go back to My Bookings
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const qualityOptions = [
    { value: "poor", label: "Poor", emoji: "😞" },
    { value: "average", label: "Average", emoji: "😐" },
    { value: "good", label: "Good", emoji: "🙂" },
    { value: "excellent", label: "Excellent", emoji: "😄" },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
            >
              <FaArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Rate Your Experience</h1>
              <p className="text-gray-600">Help others by sharing your feedback</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Provider Info */}
          {booking?.selectedProvider && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                  {booking.selectedProvider.profileImage ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/${booking.selectedProvider.profileImage}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="w-full h-full p-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {booking.selectedProvider.userId?.name || "Worker"}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-1">
                    {booking.description}
                  </p>
                  <p className="text-blue-600 font-medium">
                    Rs. {booking.finalPrice?.totalAmount?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                How was the service?
              </h3>
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
                        star <= (hoverRating || rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-gray-500 mt-2">
                {rating === 0
                  ? "Tap to rate"
                  : rating === 1
                  ? "Poor"
                  : rating === 2
                  ? "Fair"
                  : rating === 3
                  ? "Good"
                  : rating === 4
                  ? "Very Good"
                  : "Excellent!"}
              </p>
            </div>

            {/* Work Quality */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Work Quality
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setWorkQuality(option.value)}
                    className={`py-3 rounded-xl border-2 text-center transition-all ${
                      workQuality === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs font-medium text-gray-700">
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Questions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Feedback
              </h3>
              <div className="space-y-4">
                {/* Was Polite */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Was the worker polite?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWasPolite(true)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        wasPolite === true
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <FaThumbsUp className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWasPolite(false)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        wasPolite === false
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <FaThumbsDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Arrived On Time */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Arrived on time?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setArrivedOnTime(true)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        arrivedOnTime === true
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <FaThumbsUp className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setArrivedOnTime(false)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        arrivedOnTime === false
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <FaThumbsDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Price Was Fair */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Was the price fair?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPriceWasFair(true)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        priceWasFair === true
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <FaThumbsUp className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceWasFair(false)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        priceWasFair === false
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <FaThumbsDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Would Hire Again */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Would hire again?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWouldHireAgain(true)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        wouldHireAgain === true
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <FaThumbsUp className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWouldHireAgain(false)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        wouldHireAgain === false
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <FaThumbsDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Written Review */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Write a Review (Optional)
              </h3>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this worker..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none resize-none"
              />
              <p className="text-xs text-gray-400 mt-2 text-right">
                {review.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
                submitting || rating === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
              }`}
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Submit Review
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}