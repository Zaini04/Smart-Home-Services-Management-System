import React, { useState } from "react";
import { FaTimesCircle } from "react-icons/fa";

export const FormInput = ({ 
  icon: Icon, 
  label, 
  type = "text", 
  error, 
  rightElement,
  className,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div
        className={`
          relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border-2 
          transition-all duration-300 bg-white
          ${error 
            ? "border-red-300 bg-red-50" 
            : isFocused 
              ? "border-blue-500 shadow-lg shadow-blue-500/10" 
              : "border-gray-200 hover:border-gray-300"
          }
        `}
      >
        {Icon && (
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-colors ${
            isFocused ? "text-blue-500" : "text-gray-400"
          }`} />
        )}
        <input
          type={type}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm sm:text-base w-full"
        />
        {rightElement}
      </div>
      {error && (
        <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
          <FaTimesCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

