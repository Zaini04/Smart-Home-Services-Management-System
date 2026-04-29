// panels/CancelBookingModal.jsx
import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

function CancelBookingModal({ booking, cancelReason, setCancelReason, onConfirm, onClose, actionLoading }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1 text-center">Cancel Booking?</h3>
        <p className="text-gray-500 text-sm text-center mb-2">This action cannot be undone.</p>

        {booking.inspection?.completedByProvider && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
            <p className="text-amber-700 text-sm">
              ⚠️ Inspection was completed. Agreed inspection fee of Rs.{" "}
              {booking.inspection?.agreedFee || 0} will apply.
            </p>
          </div>
        )}

        {booking.status === "work_in_progress" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
            <p className="text-red-700 text-sm">
              ⚠️ Work is in progress. Cancellation penalty will include inspection fee + days worked.
            </p>
          </div>
        )}

        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Reason for cancellation (optional)"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 outline-none mb-4 resize-none text-sm"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={actionLoading}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={actionLoading}
            className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelBookingModal;

