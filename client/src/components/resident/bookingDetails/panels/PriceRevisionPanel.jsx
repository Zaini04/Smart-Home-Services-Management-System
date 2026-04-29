// pages/resident/bookingDetails/panels/PriceRevisionPanel.jsx
import React from "react";
import { FaEdit, FaCheckCircle, FaSpinner } from "react-icons/fa";

function PriceRevisionPanel({ booking, onApprove, onReject, actionLoading }) {
  const pendingRevisions = (booking.priceRevisions || []).filter(
    (r) => r.status === "pending"
  );
  if (pendingRevisions.length === 0) return null;

  const revision = pendingRevisions[pendingRevisions.length - 1];
  const oldTotal = booking.finalPrice?.totalAmount || 0;
  const diff = revision.totalAmount - oldTotal;

  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaEdit className="text-orange-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-orange-800">Price Revision Request</h3>
          <p className="text-orange-700 text-sm mt-0.5">
            Worker has requested a price change during the work.
          </p>
        </div>
      </div>

      {revision.reason && (
        <div className="bg-white rounded-xl p-3 mb-3 border border-orange-200">
          <p className="text-xs text-gray-400 mb-1">Reason:</p>
          <p className="text-gray-700 text-sm italic">"{revision.reason}"</p>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 mb-4 border border-orange-200 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Previous Total</span>
          <span className="text-gray-500 line-through">Rs. {oldTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">New Labor Cost</span>
          <span className="font-medium">Rs. {revision.laborCost?.toLocaleString()}</span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-bold text-gray-800">New Total</span>
          <span className="font-bold text-xl text-orange-600">
            Rs. {revision.totalAmount?.toLocaleString()}
          </span>
        </div>
        <div
          className={`text-sm text-center py-1 rounded-lg ${
            diff > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
          }`}
        >
          {diff > 0
            ? `+Rs. ${diff.toLocaleString()} increase`
            : `Rs. ${Math.abs(diff).toLocaleString()} decrease`}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onReject(revision._id)}
          disabled={actionLoading}
          className="flex-1 py-3 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all disabled:opacity-60"
        >
          Reject Change
        </button>
        <button
          onClick={() => onApprove(revision._id)}
          disabled={actionLoading}
          className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
          Approve Change
        </button>
      </div>
    </div>
  );
}

export default PriceRevisionPanel;

