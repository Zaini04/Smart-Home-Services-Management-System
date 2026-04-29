// pages/resident/bookingDetails/panels/RescheduleRequestPanel.jsx
import React from "react";

function RescheduleRequestPanel({ booking, onRespond, actionLoading }) {
  const req = booking.rescheduleRequest;

  if (!req || req.status !== "pending") return null;

  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
      <h3 className="font-semibold text-yellow-800 mb-2">🔄 Reschedule Request</h3>
      <p className="text-sm text-gray-700 mb-3">Worker wants to change schedule</p>

      <div className="bg-white p-3 rounded border mb-3">
        <p>
          <strong>New Time:</strong>{" "}
          {new Date(req.proposedStartDate).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onRespond("reject")}
          disabled={actionLoading}
          className="flex-1 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 disabled:opacity-60"
        >
          Reject
        </button>
        <button
          onClick={() => onRespond("approve")}
          disabled={actionLoading}
          className="flex-1 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-60"
        >
          Approve
        </button>
      </div>
    </div>
  );
}

export default RescheduleRequestPanel;

