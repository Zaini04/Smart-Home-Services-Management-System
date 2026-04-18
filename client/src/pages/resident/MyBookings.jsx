import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner,
  FaUser, FaPlus, FaEye, FaMapMarkerAlt, FaCalendarDay, FaChevronRight, FaArrowRight
} from "react-icons/fa";
import { getMyBookings } from "../../api/residentsEndpoints";
import { buildMediaUrl, getApiBaseUrl } from "../../utils/url";

const statusConfig = {
  posted: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Waiting for Offers", icon: FaClock },
  offers_received: { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Offers Received", icon: FaClipboardList },
  provider_selected: { color: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Provider Selected", icon: FaUser },
  inspection_pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Inspection Pending", icon: FaClock },
  inspection_scheduled: { color: "bg-orange-50 text-orange-700 border-orange-200", label: "Inspection Scheduled", icon: FaClock },
  inspection_done: { color: "bg-cyan-50 text-cyan-700 border-cyan-200", label: "Inspection Done", icon: FaCheckCircle },
  awaiting_final_approval: { color: "bg-amber-50 text-amber-700 border-amber-200", label: "Price Sent", icon: FaClock },
  scheduled: { color: "bg-teal-50 text-teal-700 border-teal-200", label: "Scheduled", icon: FaCheckCircle },
  work_in_progress: { color: "bg-purple-50 text-purple-700 border-purple-200", label: "In Progress", icon: FaSpinner },
  completed: { color: "bg-green-50 text-green-700 border-green-200", label: "Completed", icon: FaCheckCircle },
  cancelled: { color: "bg-red-50 text-red-700 border-red-200", label: "Cancelled", icon: FaTimesCircle },
};

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const apiBaseUrl = getApiBaseUrl();

  const [activeFilter, setActiveFilter] = useState("all");

  const { data: allBookings = [], isLoading, isError } = useQuery({
    queryKey: ["myBookings"],
    queryFn: async () => {
      const res = await getMyBookings();
      return res.data.data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("accessToken");
    const socket = io(apiBaseUrl, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("data_updated", () => {
      queryClient.invalidateQueries(["myBookings"]);
    });

    return () => socket.disconnect();
  }, [queryClient, user, apiBaseUrl]);

  if (!user) {
    navigate("/login");
    return null;
  }

  let filteredBookings = allBookings;
  if (activeFilter === "active") {
    filteredBookings = allBookings.filter((b) =>
      !["completed", "cancelled"].includes(b.status)
    );
  } else if (activeFilter === "completed") {
    filteredBookings = allBookings.filter((b) => b.status === "completed");
  } else if (activeFilter === "cancelled") {
    filteredBookings = allBookings.filter((b) => b.status === "cancelled");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* ── HEADER SECTION ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">My Bookings</h1>
            <p className="text-gray-500 text-sm md:text-base">Track and manage your service requests</p>
          </div>
          <Link 
            to="/post-job" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow-500 text-gray-900 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
          >
            <FaPlus className="w-3.5 h-3.5" /> Book New Service
          </Link>
        </div>

        {/* ── FILTER TABS ── */}
        <div className="inline-flex p-1.5 bg-gray-200/60 rounded-2xl overflow-x-auto w-full sm:w-auto">
          {[
            { key: "all", label: "All Bookings" }, 
            { key: "active", label: "Active Jobs" }, 
            { key: "completed", label: "Completed" }, 
            { key: "cancelled", label: "Cancelled" }
          ].map((filter) => (
            <button 
              key={filter.key} 
              onClick={() => setActiveFilter(filter.key)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeFilter === filter.key 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* ── ERROR/LOADING STATES ── */}
        {isError && (
          <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-center gap-3">
            <FaTimesCircle className="text-red-500 w-5 h-5" />
            <p className="text-red-700 font-medium">Failed to load bookings. Please try again later.</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : filteredBookings.length > 0 ? (
          
          /* ── BOOKING CARDS LIST ── */
          <div className="grid gap-5">
            {filteredBookings.map((booking, index) => {
              const config = statusConfig[booking.status] || statusConfig.posted;
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={booking._id} 
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
                      
                      {/* Left: Image Thumbnail */}
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

                      {/* Right: Content Area */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        
                        {/* Header Row: Title & Status */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                            {booking.description}
                          </h3>
                          <span className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${config.color}`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${booking.status === 'work_in_progress' ? 'animate-spin' : ''}`} />
                            {config.label}
                          </span>
                        </div>

                        {/* Middle Row: Meta info & Provider */}
                        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-gray-500 mb-6">
                          <div className="flex items-center gap-2">
                            <FaCalendarDay className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                            <span className="font-medium line-clamp-1 max-w-[200px]">
                              {booking.address}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row: Action/Provider Container */}
                        <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                          {/* Provider Info (if assigned) */}
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

                          {/* View Button */}
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
            })}
          </div>
        ) : (
          /* ── EMPTY STATE ── */
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaClipboardList className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
              You haven't posted any tasks matching this filter. Start by booking a new service request!
            </p>
            <Link 
              to="/post-job" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 text-gray-900 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
            >
              Book a Service <FaArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}