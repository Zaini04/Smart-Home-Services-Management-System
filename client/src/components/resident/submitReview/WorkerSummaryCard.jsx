// submitReview/WorkerSummaryCard.jsx
import React from "react";
import { FaUser } from "react-icons/fa";
import { buildMediaUrl } from "../../../utils/url";

function WorkerSummaryCard({ booking }) {
  if (!booking?.selectedProvider) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
          {booking.selectedProvider.profileImage ? (
            <img src={buildMediaUrl(booking.selectedProvider.profileImage)} alt="" className="w-full h-full object-cover" />
          ) : (
            <FaUser className="w-full h-full p-4 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">
            {booking.selectedProvider.userId?.name || "Worker"}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-1">{booking.description}</p>
          <p className="text-blue-600 font-medium">
            Rs. {booking.finalPrice?.totalAmount?.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default WorkerSummaryCard;

