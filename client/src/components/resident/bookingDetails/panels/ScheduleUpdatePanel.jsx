// pages/resident/bookingDetails/panels/ScheduleUpdatePanel.jsx
import React from "react";
import { FaCalendarAlt, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { formatSchedule } from "./bookingConstants";

function ScheduleUpdatePanel({ booking, onApprove, actionLoading }) {
  if (booking.schedule?.approvedByResident) return null;
  if (!booking.schedule?.scheduledStartDate) return null;

  const schedule = formatSchedule(booking.schedule);
  if (!schedule) return null;

  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaCalendarAlt className="text-purple-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-purple-800">Schedule Update</h3>
          <p className="text-purple-700 text-sm mt-0.5">
            Worker has updated the schedule. Please review and approve.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4 border border-purple-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-gray-500 block text-xs mb-1">Start Date</span>
            <span className="font-semibold text-gray-800">
              {schedule.dateStr} at {schedule.timeStr}
            </span>
          </div>
          {schedule.durStr && (
            <div>
              <span className="text-gray-500 block text-xs mb-1">Duration</span>
              <span className="font-semibold text-gray-800">{schedule.durStr}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onApprove}
        disabled={actionLoading}
        className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
        Approve Schedule
      </button>
    </div>
  );
}

export default ScheduleUpdatePanel;

