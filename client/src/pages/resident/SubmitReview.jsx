// submitReview/SubmitReview.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaArrowLeft, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { getBookingDetails, submitReview } from "../../api/residentsEndpoints";
import WorkerSummaryCard  from "../../components/resident/submitReview/WorkerSummaryCard";
import StarRatingInput    from "../../components/resident/submitReview/StarRatingInput";
import WorkQualitySelector from "../../components/resident/submitReview/WorkQualitySelector";
import QuickFeedback      from "../../components/resident/submitReview/QuickFeedback";

export default function SubmitReview() {
  const { bookingId } = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();

  const [booking, setBooking]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState("");

  const [rating, setRating]               = useState(0);
  const [hoverRating, setHoverRating]     = useState(0);
  const [review, setReview]               = useState("");
  const [workQuality, setWorkQuality]     = useState("");
  const [wasPolite, setWasPolite]         = useState(null);
  const [arrivedOnTime, setArrivedOnTime] = useState(null);
  const [priceWasFair, setPriceWasFair]   = useState(null);
  const [wouldHireAgain, setWouldHireAgain] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res         = await getBookingDetails(bookingId);
        const bookingData = res.data.data.booking;
        if (bookingData.status !== "completed") setError("Can only review completed bookings");
        else if (bookingData.isReviewed)        setError("You have already reviewed this booking");
        setBooking(bookingData);
      } catch (err) {
        setError("Failed to load booking");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating"); return; }
    try {
      setSubmitting(true);
      setError("");
      await submitReview(bookingId, { rating, review, workQuality, wasPolite, arrivedOnTime, priceWasFair, wouldHireAgain });
      setSuccess(true);
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <FaSpinner className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You! 🎉</h2>
        <p className="text-gray-600 mb-4">Your review has been submitted successfully.</p>
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <FaSpinner className="animate-spin" /><span>Redirecting...</span>
        </div>
      </div>
    </div>
  );

  if (error && !booking) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{error}</h2>
        <button onClick={() => navigate("/my-bookings")} className="text-blue-600 hover:underline">Go back to My Bookings</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50">
            <FaArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Rate Your Experience</h1>
            <p className="text-gray-600">Help others by sharing your feedback</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <WorkerSummaryCard booking={booking} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <StarRatingInput rating={rating} setRating={setRating} hoverRating={hoverRating} setHoverRating={setHoverRating} />
          <WorkQualitySelector workQuality={workQuality} setWorkQuality={setWorkQuality} />
          <QuickFeedback
            values={{ wasPolite, arrivedOnTime, priceWasFair, wouldHireAgain }}
            setters={{ wasPolite: setWasPolite, arrivedOnTime: setArrivedOnTime, priceWasFair: setPriceWasFair, wouldHireAgain: setWouldHireAgain }}
          />

          {/* Written Review */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Write a Review (Optional)</h3>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this worker..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{review.length}/500 characters</p>
          </div>

          <button
            type="submit"
            disabled={submitting || rating === 0}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
              submitting || rating === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
            }`}
          >
            {submitting ? <><FaSpinner className="animate-spin" /> Submitting...</> : <><FaCheckCircle /> Submit Review</>}
          </button>
        </form>
      </div>
    </div>
  );
}

