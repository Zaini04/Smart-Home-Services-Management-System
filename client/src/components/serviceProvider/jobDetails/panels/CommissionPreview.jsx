// jobDetails/panels/CommissionPreview.jsx
import React from "react";
import { FaWallet } from "react-icons/fa";
import { calculateCommission } from "../../../../utils/commissionCalc";

function CommissionPreview({ laborCost, walletBalance = 0 }) {
  const labor = Number(laborCost) || 0;
  if (labor <= 0) return null;
  const comm = calculateCommission(labor);
  const earning = labor - comm.finalCommission;
  const hasEnough = walletBalance - comm.finalCommission >= 0;

  return (
    <div className={`rounded-xl p-4 border mb-4 space-y-1.5 ${hasEnough ? "bg-white border-green-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Labor</span>
        <span>Rs. {labor.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">
          Commission ({comm.ratePercent})
          {comm.isNewProvider && <span className="text-green-600 ml-1">50% off!</span>}
        </span>
        <span className="text-red-600">- Rs. {comm.finalCommission.toLocaleString()}</span>
      </div>
      <div className="border-t pt-1.5 flex justify-between font-bold text-green-700">
        <span>Your Earning</span>
        <span>Rs. {earning.toLocaleString()}</span>
      </div>
      {!hasEnough && (
        <div className="bg-red-100 rounded-lg p-2 mt-2 flex items-start gap-2">
          <FaWallet className="text-red-500 mt-0.5 flex-shrink-0 w-3.5 h-3.5" />
          <p className="text-red-700 text-xs">
            Wallet needs Rs. {comm.finalCommission.toLocaleString()} for commission. Balance: Rs. {walletBalance.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default CommissionPreview;

