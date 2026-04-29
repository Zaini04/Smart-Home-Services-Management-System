// submitReview/WorkQualitySelector.jsx
import React from "react";

const qualityOptions = [
  { value: "poor",      label: "Poor",      emoji: "😞" },
  { value: "average",   label: "Average",   emoji: "😐" },
  { value: "good",      label: "Good",      emoji: "🙂" },
  { value: "excellent", label: "Excellent", emoji: "😄" },
];

function WorkQualitySelector({ workQuality, setWorkQuality }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Work Quality</h3>
      <div className="grid grid-cols-4 gap-2">
        {qualityOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setWorkQuality(option.value)}
            className={`py-3 rounded-xl border-2 text-center transition-all ${
              workQuality === option.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-2xl mb-1">{option.emoji}</div>
            <div className="text-xs font-medium text-gray-700">{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default WorkQualitySelector;

