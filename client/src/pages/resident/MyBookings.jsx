// myBookings/MyBookings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { FaTimesCircle, FaSpinner, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getMyBookings } from "../../api/residentsEndpoints";
import { getApiBaseUrl } from "../../utils/url";
import { filterOptions } from "../../components/resident/myBookings/myBookingsConstants";
import BookingCard from "../../components/resident/myBookings/BookingCard";
import EmptyBookingsState from "../../components/resident/myBookings/EmptyBookingsState";

export default function MyBookings() {
  const { user }       = useAuth();
  const navigate       = useNavigate();
  const queryClient    = useQueryClient();
  const apiBaseUrl     = getApiBaseUrl();
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
    const socket = io(apiBaseUrl, { auth: { token }, withCredentials: true, transports: ["websocket", "polling"] });
    socket.on("data_updated", () => queryClient.invalidateQueries(["myBookings"]));
    return () => socket.disconnect();
  }, [queryClient, user, apiBaseUrl]);

  if (!user) { navigate("/login"); return null; }

  let filteredBookings = allBookings;
  if (activeFilter === "active")    filteredBookings = allBookings.filter((b) => !["completed", "cancelled"].includes(b.status));
  if (activeFilter === "completed") filteredBookings = allBookings.filter((b) => b.status === "completed");
  if (activeFilter === "cancelled") filteredBookings = allBookings.filter((b) => b.status === "cancelled");

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">My Bookings</h1>
            <p className="text-gray-500 text-sm md:text-base">Track and manage your service requests</p>
          </div>
          <Link to="/post-job" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow-500 text-gray-900 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20">
            <FaPlus className="w-3.5 h-3.5" /> Book New Service
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex p-1.5 bg-gray-200/60 rounded-2xl overflow-x-auto w-full sm:w-auto">
          {filterOptions.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeFilter === filter.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {isError && (
          <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-center gap-3">
            <FaTimesCircle className="text-red-500 w-5 h-5" />
            <p className="text-red-700 font-medium">Failed to load bookings. Please try again later.</p>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid gap-5">
            {filteredBookings.map((booking, index) => (
              <BookingCard key={booking._id} booking={booking} index={index} />
            ))}
          </div>
        ) : (
          <EmptyBookingsState />
        )}
      </div>
    </div>
  );
}

