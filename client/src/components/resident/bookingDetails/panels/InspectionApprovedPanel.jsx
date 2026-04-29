// pages/resident/bookingDetails/panels/InspectionApprovedPanel.jsx
import React from "react";
import { FaClock, FaCalendarAlt } from "react-icons/fa";

function InspectionApprovedPanel({ booking }) {
  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaClock className="text-orange-600 w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-semibold text-orange-800">Inspection Approved</h3>
          <p className="text-orange-700 text-sm mt-0.5">
            Agreed fee: Rs.{" "}
            {(booking.inspection?.agreedFee || 0).toLocaleString()}. Worker will
            visit to inspect.
          </p>
        </div>
        {booking.inspection?.scheduledDate && (
          <div className="bg-white rounded-xl p-3 mt-3 border border-amber-200 flex items-center gap-2">
            <FaCalendarAlt className="text-amber-600 w-4 h-4" />
            <span className="text-sm text-gray-700">
              Worker will visit on:{" "}
              <span className="font-semibold">
                {new Date(booking.inspection.scheduledDate).toLocaleDateString()}{" "}
                at {booking.inspection.scheduledTime}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default InspectionApprovedPanel;

