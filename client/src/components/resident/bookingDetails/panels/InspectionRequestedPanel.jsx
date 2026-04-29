// pages/resident/bookingDetails/panels/InspectionRequestedPanel.jsx
import React, { useState } from "react";
import { FaSearch, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";

function InspectionRequestedPanel({ booking, onRespond, actionLoading }) {
  const [counterFee, setCounterFee] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const isCounterOffer = booking.inspection?.status === "counter_offered";

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaSearch className="text-amber-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-800">Inspection Requested</h3>
          <p className="text-amber-700 text-sm mt-0.5">
            Worker wants to inspect before providing a final price.
          </p>
        </div>
      </div>

      {booking.inspection?.message && (
        <div className="bg-white rounded-xl p-3 mb-3 border border-amber-200">
          <p className="text-xs text-gray-400 mb-1">Worker's message:</p>
          <p className="text-gray-700 text-sm italic">"{booking.inspection.message}"</p>
        </div>
      )}

      {isCounterOffer && (
        <div className="bg-blue-50 rounded-xl p-3 mb-3 border border-blue-200">
          <p className="text-blue-700 text-sm">
            ⏳ Your counter offer of Rs. {booking.inspection.counterFee} was sent. Waiting for worker's response.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 mb-4 border border-amber-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Proposed Inspection Fee</span>
          <span className="font-bold text-gray-800 text-lg">
            Rs. {(booking.inspection?.fee || 0).toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          This fee applies even if you cancel after inspection
        </p>
      </div>

      {booking.inspection?.scheduledDate && (
        <div className="bg-white rounded-xl p-3 mt-3 border border-amber-200 flex items-center gap-2">
          <FaCalendarAlt className="text-amber-600 w-4 h-4" />
          <span className="text-sm text-gray-700">
            Worker will visit on:{" "}
            <span className="font-semibold">
              {new Date(booking.inspection.scheduledDate).toLocaleDateString()}{" "}
              at {booking.inspection.scheduledTime}
            </span>
          </span>
        </div>
      )}

      {!isCounterOffer &&
        (showCounter ? (
          <div className="bg-white rounded-xl p-4 mb-4 border border-amber-200 space-y-3 mt-4">
            <label className="text-sm font-medium text-gray-700">Your Counter Fee (Rs.)</label>
            <input
              type="number"
              value={counterFee}
              onChange={(e) => setCounterFee(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-400 outline-none text-sm"
            />
            <textarea
              value={counterMessage}
              onChange={(e) => setCounterMessage(e.target.value)}
              placeholder="Message (optional)"
              rows={2}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-400 outline-none text-sm resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCounter(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm"
              >
                Back
              </button>
              <button
                onClick={() => onRespond("counter", Number(counterFee), counterMessage)}
                disabled={actionLoading || !counterFee}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-60"
              >
                Send Counter Offer
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onRespond("reject")}
              disabled={actionLoading}
              className="flex-1 py-3 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 disabled:opacity-60"
            >
              <FaTimesCircle className="inline mr-1" /> Reject
            </button>
            <button
              onClick={() => setShowCounter(true)}
              className="flex-1 py-3 border-2 border-blue-300 text-blue-600 rounded-xl font-medium hover:bg-blue-50"
            >
              💬 Counter
            </button>
            <button
              onClick={() => onRespond("approve")}
              disabled={actionLoading}
              className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-1"
            >
              {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
              Approve
            </button>
          </div>
        ))}
    </div>
  );
}

export default InspectionRequestedPanel;

