// pages/resident/bookingDetails/panels/OfferCard.jsx
import React from "react";
import { FaUser, FaStar, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { buildMediaUrl } from "../../../../utils/url";

function OfferCard({ offer, onAccept, actionLoading }) {
  return (
    <div className="border-2 border-gray-200 hover:border-blue-300 rounded-2xl p-4 transition-all">
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
          {offer.provider?.profileImage ? (
            <img
              src={buildMediaUrl(offer.provider.profileImage)}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaUser className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h4 className="font-semibold text-gray-800">
                {offer.provider?.userId?.name || "Worker"}
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                <div className="flex items-center gap-1 text-yellow-500">
                  <FaStar className="w-3 h-3" />
                  <span className="text-gray-600">
                    {offer.provider?.rating?.toFixed(1) || "New"}
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <span>{offer.provider?.completedJobs || 0} jobs done</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-bold text-blue-600">
                Rs. {offer.laborEstimate?.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">labor estimate</p>
            </div>
          </div>

          {offer.message && (
            <p className="text-gray-600 text-sm bg-gray-50 rounded-xl p-3 mb-3 italic">
              "{offer.message}"
            </p>
          )}

          <button
            onClick={() => onAccept(offer._id)}
            disabled={actionLoading}
            className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
            Accept This Offer
          </button>
        </div>
      </div>
    </div>
  );
}

export default OfferCard;

