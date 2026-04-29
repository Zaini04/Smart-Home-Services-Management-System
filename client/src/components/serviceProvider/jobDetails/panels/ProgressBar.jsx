// jobDetails/panels/ProgressBar.jsx
import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { steps } from "./jobConstants";

function ProgressBar({ currentStep, cancelled }) {
  if (cancelled) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 bg-red-50 rounded-xl">
        <FaTimesCircle className="text-red-500" />
        <span className="text-red-600 font-medium text-sm">Job Cancelled</span>
      </div>
    );
  }
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-blue-500 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((s) => {
          const done = currentStep > s.step;
          const active = currentStep === s.step;
          return (
            <div key={s.step} className="flex flex-col items-center z-10">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? "bg-blue-500 border-blue-500" : active ? "bg-white border-blue-500 shadow-md shadow-blue-200" : "bg-white border-gray-300"}`}>
                {done ? <FaCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <span className={`text-[10px] sm:text-xs font-bold ${active ? "text-blue-600" : "text-gray-400"}`}>{s.step}</span>}
              </div>
              <span className={`text-[9px] sm:text-xs mt-1 font-medium text-center px-0.5 leading-tight ${active ? "text-blue-600" : done ? "text-gray-600" : "text-gray-400"}`}>
                <span className="hidden xs:inline">{s.label}</span>
                <span className="xs:hidden">{s.label.split(' ')[0]}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressBar;

