import React from "react";

export const Card = ({
  children,
  className = "",
  padding = "p-6",
}) => {
  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden ${padding} ${className}`}>
      {children}
    </div>
  );
};

