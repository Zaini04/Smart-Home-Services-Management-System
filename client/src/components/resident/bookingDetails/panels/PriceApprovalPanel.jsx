// pages/resident/bookingDetails/panels/PriceApprovalPanel.jsx
import React from "react";
import { FaMoneyBillWave, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { formatSchedule } from "./bookingConstants";

function PriceApprovalPanel({ booking, onApprove, onReject, actionLoading }) {
  const labor = booking.finalPrice?.laborCost || 0;
  const schedule = formatSchedule(booking.schedule);

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaMoneyBillWave className="text-blue-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-800">Final Price &amp; Schedule</h3>
          <p className="text-blue-700 text-sm mt-0.5">
            Review the labor cost and schedule, then approve to proceed.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 mb-3 border border-blue-200 space-y-2">
        <div className="flex justify-between">
          <span className="font-bold text-gray-800">Labor Cost</span>
          <span className="font-bold text-xl text-blue-600">
            Rs. {labor.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Materials (if any) are arranged separately outside the platform
        </p>
      </div>

      {schedule && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <FaCalendarAlt className="text-blue-600 w-4 h-4" />
            <span className="font-medium text-gray-800 text-sm">Schedule</span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Start:</span>
              <span className="font-medium text-gray-800">
                {schedule.dateStr} at {schedule.timeStr}
              </span>
            </div>
            {schedule.durStr && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium text-gray-800">{schedule.durStr}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onReject}
          disabled={actionLoading}
          className="flex-1 py-3 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all disabled:opacity-60"
        >
          <FaTimesCircle className="inline mr-2" /> Reject
        </button>
        <button
          onClick={onApprove}
          disabled={actionLoading}
          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
          Approve
        </button>
      </div>
    </div>
  );
}

export default PriceApprovalPanel;

