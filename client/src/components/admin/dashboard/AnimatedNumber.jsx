import React, { useState, useEffect } from "react";

const AnimatedNumber = ({ value, prefix = "", suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [colorClass, setColorClass] = useState("text-gray-900");

  useEffect(() => {
    if (value > displayValue) {
      setColorClass("text-green-500 scale-110 transition-all duration-300");
    } else if (value < displayValue) {
      setColorClass("text-red-500 scale-90 transition-all duration-300");
    }
    
    setDisplayValue(value);
    
    const timeout = setTimeout(() => {
      setColorClass("text-gray-900 scale-100 transition-all duration-500");
    }, 600);

    return () => clearTimeout(timeout);
  }, [value, displayValue]);

  return (
    <span className={`inline-block font-bold ${colorClass}`}>
      {prefix}{Number(displayValue).toLocaleString()}{suffix}
    </span>
  );
};

export default AnimatedNumber;
