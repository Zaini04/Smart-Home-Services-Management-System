import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner,
  FaUser, FaPlus, FaStar, FaEye, FaMapMarkerAlt,
} from "react-icons/fa";
import { getMyBookings } from "../../api/residentsEndpoints";

const statusConfig = {
  posted: { color: "bg-blue-100 text-blue-700", label: "Waiting for Offers", icon: FaClock },
  offers_received: { color: "bg-purple-100 text-purple-700", label: "Offers Received", icon: FaClipboardList },
  provider_selected: { color: "bg-indigo-100 text-indigo-700", label: "Provider Selected", icon: FaUser },
  inspection_pending: { color: "bg-yellow-100 text-yellow-700", label: "Inspection Pending", icon: FaClock },
  inspection_scheduled: { color: "bg-orange-100 text-orange-700", label: "Inspection Scheduled", icon: FaClock },
  inspection_done: { color: "bg-cyan-100 text-cyan-700", label: "Inspection Done", icon: FaCheckCircle },
  awaiting_final_approval: { color: "bg-amber-100 text-amber-700", label: "Price Sent", icon: FaClock },
  scheduled: { color: "bg-teal-100 text-teal-700", label: "Scheduled", icon: FaCheckCircle },
  work_in_progress: { color: "bg-purple-100 text-purple-700", label: "In Progress", icon: FaSpinner },
  completed: { color: "bg-green-100 text-green-700", label: "Completed", icon: FaCheckCircle },
  cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled", icon: FaTimesCircle },
};

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState("all");

  // React Query: Fetch and Cache
  const { data: allBookings = [], isLoading, isError } = useQuery({
    queryKey: ["myBookings"],
    queryFn: async () => {
      const res = await getMyBookings();
      return res.data.data || [];
    },
    enabled: !!user,
  });

  // Socket: Real-time Updates
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("accessToken");
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token },
      withCredentials: true,
    });

    socket.on("data_updated", () => {
      // Silently refetch data when a worker sends an offer or updates status
      queryClient.invalidateQueries(["myBookings"]);
    });

    return () => socket.disconnect();
  }, [queryClient, user]);

  if (!user) {
    navigate("/login");
    return null;
  }

  // Filter Logic
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
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
              <p className="text-gray-600">Track your service requests</p>
            </div>
            <Link to="/post-job" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
              <FaPlus /> Post New Job
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {[{ key: "all", label: "All" }, { key: "active", label: "Active" }, { key: "completed", label: "Completed" }, { key: "cancelled", label: "Cancelled" }].map((filter) => (
                <button key={filter.key} onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeFilter === filter.key ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {isError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6">
              <p className="text-red-700">Failed to load bookings</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <FaSpinner className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const config = statusConfig[booking.status] || statusConfig.posted;
                const StatusIcon = config.icon;
                return (
                  <Link key={booking._id} to={`/booking/${booking._id}`} className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {booking.images?.[0] ? (
                          <img src={`${import.meta.env.VITE_BASE_URL}/${booking.images[0]}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><FaClipboardList className="w-8 h-8 text-gray-400" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-blue-600 mb-1">{booking.category?.name || "Service"}</p>
                            <h3 className="font-semibold text-gray-800 line-clamp-2">{booking.description}</h3>
                          </div>
                          <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
                            <StatusIcon className={`w-3 h-3 ${booking.status === 'work_in_progress' ? 'animate-spin' : ''}`} />
                            {config.label}
                          </span>
                        </div>
                        {booking.selectedProvider && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden border">
                              {booking.selectedProvider.profileImage ? (
                                <img src={`${import.meta.env.VITE_BASE_URL}/${booking.selectedProvider.profileImage}`} alt="" className="w-full h-full object-cover" />
                              ) : <FaUser className="w-full h-full p-1 text-gray-400" />}
                            </div>
                            <span className="text-sm text-gray-600">Worker assigned</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                          <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0" />
                          <span className="line-clamp-1">{booking.address}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="text-blue-600 text-sm font-medium flex items-center gap-1">
                            <FaEye className="w-3 h-3" /> View Details
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <FaClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Yet</h3>
              <p className="text-gray-500 mb-6">No {activeFilter} bookings found</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}