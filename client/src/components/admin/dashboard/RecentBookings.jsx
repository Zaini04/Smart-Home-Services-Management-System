import React from "react";
import { FaClock } from "react-icons/fa";

const RecentBookings = ({ bookings }) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FaClock className="text-blue-500" /> Recent Bookings
        </h2>
      </div>
      <div className="divide-y divide-gray-100">
        {bookings.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No recent activities found.</p>
        ) : (
          bookings.map((activity) => (
            <div
              key={activity._id}
              className="p-4 px-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  {activity.resident?.profileImage ? (
                    <img
                      src={activity.resident.profileImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                      {activity.resident?.full_name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {activity.category?.name || "Service Request"}
                  </p>
                  <p className="text-xs text-gray-500">By: {activity.resident?.full_name}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 rounded-md text-gray-600 uppercase tracking-wide">
                  {activity.status.replace(/_/g, " ")}
                </span>
                <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                  {new Date(activity.createdAt).toLocaleDateString()} at{" "}
                  {new Date(activity.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentBookings;
