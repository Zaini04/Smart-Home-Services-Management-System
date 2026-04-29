// submitReview/QuickFeedback.jsx
import React from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const questions = [
  { label: "Was the worker polite?",  key: "wasPolite" },
  { label: "Arrived on time?",        key: "arrivedOnTime" },
  { label: "Was the price fair?",     key: "priceWasFair" },
  { label: "Would hire again?",       key: "wouldHireAgain" },
];

function QuickFeedback({ values, setters }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Feedback</h3>
      <div className="space-y-4">
        {questions.map(({ label, key }) => {
          const value  = values[key];
          const setter = setters[key];
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-700">{label}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setter(true)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    value === true
                      ? "border-green-500 bg-green-50 text-green-600"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <FaThumbsUp className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setter(false)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    value === false
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <FaThumbsDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default QuickFeedback;

