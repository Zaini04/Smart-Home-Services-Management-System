// jobDetails/panels/CompleteWorkPanel.jsx
import React from "react";
import { FaShieldAlt, FaCheckCircle, FaSpinner } from "react-icons/fa";

function CompleteWorkPanel({ booking, onComplete, loading }) {
  const code = booking.otp?.complete?.code;
  return (
    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaShieldAlt className="text-indigo-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-indigo-800">Work In Progress</h3>
          <p className="text-indigo-700 text-sm mt-0.5">Show the Complete OTP to the resident.</p>
        </div>
      </div>
      {code && (
        <div className="bg-white rounded-xl p-4 border-2 border-indigo-200 text-center mb-4">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Complete OTP</p>
          <div className="flex items-center justify-center gap-2">
            {code.split("").map((d, i) => (
              <div key={i} className="w-14 h-16 bg-indigo-50 rounded-xl flex items-center justify-center text-3xl font-bold text-indigo-700 border-2 border-indigo-200">
                {d}
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={onComplete} disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Mark Work Completed
      </button>
    </div>
  );
}

export default CompleteWorkPanel;

