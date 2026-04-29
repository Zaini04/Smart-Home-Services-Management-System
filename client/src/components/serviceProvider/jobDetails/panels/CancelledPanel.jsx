// jobDetails/panels/CancelledPanel.jsx
import React from "react";
import { FaTimesCircle } from "react-icons/fa";

function CancelledPanel({ booking }) {
  const penalty = booking.cancellationPenalty;
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaTimesCircle className="text-red-600 w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-800">Job Cancelled</h3>
          <p className="text-red-700 text-sm mt-0.5">Cancelled by: <span className="capitalize font-medium">{booking.cancelledBy}</span></p>
          {booking.cancellationReason && <p className="text-red-600 text-sm mt-1">Reason: {booking.cancellationReason}</p>}
          {penalty && penalty.amount > 0 && (
            <div className="mt-3 bg-red-100 rounded-xl p-3">
              <p className="text-red-800 text-sm font-semibold">Penalty: Rs. {penalty.amount?.toLocaleString()}</p>
              <p className="text-red-700 text-xs">Paid by: <span className="capitalize">{penalty.paidBy}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CancelledPanel;

