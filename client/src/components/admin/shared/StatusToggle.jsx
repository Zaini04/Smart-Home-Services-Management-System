import React from "react";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";

const StatusToggle = ({ isActive, onChange }) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => onChange(true)}
      className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2
        ${isActive
          ? "border-green-500 bg-green-50 text-green-700"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
        }`}
    >
      <FaToggleOn className={`w-4 h-4 ${isActive ? "text-green-600" : "text-gray-400"}`} />
      Active
    </button>
    <button
      type="button"
      onClick={() => onChange(false)}
      className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2
        ${!isActive
          ? "border-red-500 bg-red-50 text-red-700"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
        }`}
    >
      <FaToggleOff className={`w-4 h-4 ${!isActive ? "text-red-600" : "text-gray-400"}`} />
      Inactive
    </button>
  </div>
);

export default StatusToggle;
