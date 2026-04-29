// pages/resident/bookingDetails/panels/CompletedPanel.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaStar } from "react-icons/fa";

function CompletedPanel({ booking }) {
  const navigate = useNavigate();
  const labor = booking.finalPrice?.laborCost || 0;

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <FaCheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-green-800 mb-1">Job Completed!</h3>
      <p className="text-green-700 text-sm mb-4">
        Payment confirmed. Thank you for using our service!
      </p>

      <div className="bg-white rounded-xl p-4 border border-green-200 text-left space-y-2 mb-4">
        <p className="font-semibold text-gray-700 mb-2">Payment Summary</p>
        <div className="flex justify-between font-bold">
          <span>Labor Cost Paid</span>
          <span className="text-green-600">Rs. {labor.toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-400">
          Payment via{" "}
          <span className="capitalize font-medium">{booking.paymentMethod}</span>
        </p>
      </div>

      {!booking.isReviewed ? (
        <button
          onClick={() => navigate(`/review/${booking._id}`)}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-semibold hover:shadow-md transition-all"
        >
          ⭐ Rate &amp; Review Worker
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 py-3 bg-yellow-50 rounded-xl border border-yellow-200">
          <FaStar className="text-yellow-500" />
          <span className="text-yellow-700 font-medium text-sm">Review Submitted</span>
        </div>
      )}
    </div>
  );
}

export default CompletedPanel;

