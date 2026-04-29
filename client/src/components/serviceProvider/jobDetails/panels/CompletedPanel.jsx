// jobDetails/panels/CompletedPanel.jsx
import React from "react";
import { FaCheckCircle } from "react-icons/fa";

function CompletedPanel({ booking }) {
  const labor = booking.finalPrice?.laborCost || 0;
  const commission = booking.commission?.amount || 0;
  const earning = booking.providerEarning || labor - commission;
  
  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <FaCheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-green-800 mb-1">Job Completed! 🎉</h3>
      <div className="bg-white rounded-xl p-4 border border-green-200 text-left space-y-2 mt-4">
        <p className="font-semibold text-gray-700 mb-2 text-sm">Payment Summary</p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Labor Cost</span>
          <span>Rs. {labor.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Commission</span>
          <span className="text-red-600">- Rs. {commission.toLocaleString()}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-green-700">
          <span>Your Earning</span>
          <span className="text-lg">Rs. {earning.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default CompletedPanel;

