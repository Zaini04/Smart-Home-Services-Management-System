import React from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

export const Alert = ({
  type = "info",
  title,
  message,
  className = "",
}) => {
  const configs = {
    success: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: FaCheckCircle, iconColor: "text-green-600" },
    error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: FaTimesCircle, iconColor: "text-red-600" },
    info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: FaInfoCircle, iconColor: "text-blue-600" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: FaExclamationTriangle, iconColor: "text-amber-600" },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl flex items-start gap-3 shadow-sm border ${config.bg} ${config.border} ${config.text} ${className}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div>
        {title && <h4 className="font-bold mb-1">{title}</h4>}
        {message && <p className="text-sm font-medium">{message}</p>}
      </div>
    </div>
  );
};

