import React from "react";
import { FaCheck } from "react-icons/fa";

export const StepIndicator = ({ currentStep, totalSteps }) => {
  const firstRowSteps = [1, 2, 3];
  const secondRowSteps = [4, 5];

  const renderStepRow = (steps) => (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {steps.map((stepNum, idx) => (
        <React.Fragment key={stepNum}>
          <div
            className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0
              transition-all duration-300
              ${stepNum <= currentStep 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                : "bg-gray-100 text-gray-400"
              }
            `}
          >
            {stepNum < currentStep ? <FaCheck className="w-3 h-3 sm:w-4 sm:h-4" /> : stepNum}
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-8 sm:w-12 h-1 rounded-full transition-colors flex-shrink-0 ${
              stepNum < currentStep ? "bg-blue-600" : "bg-gray-200"
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="mb-6 sm:mb-8 space-y-2">
      {renderStepRow(firstRowSteps)}
      {renderStepRow(secondRowSteps)}
    </div>
  );
};

