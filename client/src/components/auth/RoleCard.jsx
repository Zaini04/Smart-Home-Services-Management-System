import React from "react";
import { FaCheck } from "react-icons/fa";

export const RoleCard = ({ icon: Icon, title, description, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`
      relative flex-1 p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 text-left transition-all duration-300 transform
      ${isSelected 
        ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10 scale-[1.02]" 
        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
      }
    `}
  >
    <div className={`
      w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 transition-colors
      ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}
    `}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
    <h3 className={`text-sm sm:text-base font-semibold mb-1 ${isSelected ? "text-blue-900" : "text-gray-800"}`}>
      {title}
    </h3>
    <p className={`text-xs sm:text-sm ${isSelected ? "text-blue-700" : "text-gray-500"}`}>
      {description}
    </p>
    {isSelected && (
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center">
        <FaCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
      </div>
    )}
  </button>
);

