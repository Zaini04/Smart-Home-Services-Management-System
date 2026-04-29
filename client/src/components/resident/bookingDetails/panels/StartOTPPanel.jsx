// pages/resident/bookingDetails/panels/StartOTPPanel.jsx
import React, { useState } from "react";
import { FaKey, FaCalendarAlt } from "react-icons/fa";
import { formatSchedule } from "./bookingConstants";

function StartOTPPanel({ booking }) {
  const [copied, setCopied] = useState(false);
  const code = booking.otp?.start?.code || "----";
  const schedule = formatSchedule(booking.schedule);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaKey className="text-teal-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-teal-800">Start OTP</h3>
          <p className="text-teal-700 text-sm mt-0.5">
            Share this OTP with the worker when they arrive.
          </p>
        </div>
      </div>

      {schedule && (
        <div className="bg-white rounded-xl p-3 mb-3 border border-teal-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaCalendarAlt className="text-teal-600 w-3 h-3" />
            <span>
              Scheduled: {schedule.dateStr} at {schedule.timeStr}
            </span>
            {schedule.durStr && (
              <span className="text-gray-400">• {schedule.durStr}</span>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 border-2 border-teal-200 text-center mb-3">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Start OTP</p>
        <div className="flex items-center justify-center gap-3">
          {code.split("").map((digit, i) => (
            <div
              key={i}
              className="w-14 h-16 bg-teal-50 rounded-xl flex items-center justify-center text-3xl font-bold text-teal-700 border-2 border-teal-200"
            >
              {digit}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="w-full py-2.5 border-2 border-teal-300 text-teal-700 rounded-xl font-medium hover:bg-teal-100 transition-all"
      >
        {copied ? "✅ Copied!" : "📋 Copy OTP"}
      </button>
    </div>
  );
}

export default StartOTPPanel;

