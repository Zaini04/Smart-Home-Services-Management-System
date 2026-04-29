import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import AnimatedNumber from "./AnimatedNumber";

const PendingWorkers = ({ workers, totalPending }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-gray-100 bg-amber-50/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2">
          <FaExclamationCircle /> Action Required
        </h2>
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
          <AnimatedNumber value={totalPending} /> Pending
        </span>
      </div>

      <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
        {workers.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center text-gray-400 h-full">
            <FaCheckCircle className="text-4xl text-green-300 mb-3" />
            <p className="font-medium text-gray-600">All caught up!</p>
            <p className="text-xs text-center mt-1">No workers are pending approval.</p>
          </div>
        ) : (
          workers.map((worker) => (
            <Link
              key={worker._id}
              to={`/admin/update-kyc/${worker._id}`}
              className="p-4 flex items-center justify-between hover:bg-amber-50/30 transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  {worker.userId?.profileImage ? (
                    <img
                      src={worker.userId.profileImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-700 font-bold">
                      {worker.userId?.full_name?.charAt(0) || "W"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800 group-hover:text-amber-700 transition">
                    {worker.userId?.full_name || "Unknown"}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{worker.userId?.phone}</p>
                </div>
              </div>
              <button className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded font-medium group-hover:bg-amber-500 group-hover:text-white transition">
                Review
              </button>
            </Link>
          ))
        )}
      </div>

      {totalPending > 5 && (
        <div className="p-3 text-center border-t border-gray-100 bg-gray-50 mt-auto">
          <Link
            to="/admin/pending-workers"
            className="text-blue-600 font-semibold text-sm hover:underline"
          >
            View all {totalPending} pending workers &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};

export default PendingWorkers;
