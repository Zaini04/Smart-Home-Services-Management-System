// jobDetails/panels/StartWorkPanel.jsx
import React from "react";
import { FaTools, FaSpinner } from "react-icons/fa";

function StartWorkPanel({ onStart, loading }) {
  return (
    <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-5 text-center">
      <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <FaTools className="w-7 h-7 text-teal-600" />
      </div>
      <h3 className="font-semibold text-teal-800 mb-1">Ready to Start?</h3>
      <p className="text-teal-700 text-sm mb-4">OTP verified! Click below to officially start the work.</p>
      <button onClick={onStart} disabled={loading} className="w-full py-3 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <FaSpinner className="animate-spin" /> : <FaTools />} Start Work Now
      </button>
    </div>
  );
}

export default StartWorkPanel;

