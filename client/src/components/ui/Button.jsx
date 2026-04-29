import React from "react";
import { FaSpinner } from "react-icons/fa";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  icon: Icon,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent",
    outline: "bg-transparent border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30",
    warning: "bg-yellow-500 text-gray-900 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20",
  };

  const sizes = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-sm sm:text-base",
    lg: "py-4 px-8 text-lg",
  };

  return (
    <button
      disabled={loading || disabled}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading && <FaSpinner className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />}
      {!loading && Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
      {children}
    </button>
  );
};

