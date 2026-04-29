// myBookings/BookingCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaClipboardList, FaUser, FaCalendarDay, FaMapMarkerAlt, FaChevronRight,
} from "react-icons/fa";
import { buildMediaUrl } from "../../../utils/url";
import { statusConfig } from "./myBookingsConstants";

function BookingCard({ booking, index }) {
  const config = statusConfig[booking.status] || statusConfig.posted;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/booking/${booking._id}`}
        className="block bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
      >
        <div className="flex flex-col md:flex-row gap-6">

          {/* Image Thumbnail */}
          <div className="w-full md:w-40 h-40 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative">
            {booking.images?.[0] ? (
              <img src={buildMediaUrl(booking.images[0])} alt="Booking" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <FaClipboardList className="w-10 h-10 mb-2" />
                <span className="text-xs font-medium">No Image</span>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
              {booking.category?.name || "Service"}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col">

            {/* Header Row */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                {booking.description}
              </h3>
              <span className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${config.color}`}>
                <StatusIcon className={`w-3.5 h-3.5 ${booking.status === "work_in_progress" ? "animate-spin" : ""}`} />
                {config.label}
              </span>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <FaCalendarDay className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                <span className="font-medium line-clamp-1 max-w-[200px]">{booking.address}</span>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
              {booking.selectedProvider ? (
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-white overflow-hidden border border-gray-200">
                    {booking.selectedProvider.profileImage ? (
                      <img src={buildMediaUrl(booking.selectedProvider.profileImage)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="w-full h-full p-2 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Assigned to</p>
                    <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">
                      {booking.selectedProvider.name || "Worker"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-medium text-gray-400">Not assigned yet</div>
              )}
              <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:text-blue-700 transition">
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">View</span>
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <FaChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default BookingCard;

