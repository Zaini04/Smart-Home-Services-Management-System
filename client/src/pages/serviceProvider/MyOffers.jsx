import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import {
  FaClipboardList, FaSpinner, FaClock, FaCheckCircle, FaTimesCircle,
  FaMapMarkerAlt, FaChevronRight, FaExclamationTriangle, FaCalendarDay
} from "react-icons/fa";
import { getMyOffers } from "../../api/serviceProviderEndPoints";
import { calculateCommission } from "../../utils/commissionCalc";
import { getApiBaseUrl } from "../../utils/url";

const offerStatusConfig = {
  pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Pending", icon: FaClock },
  accepted: { color: "bg-green-50 text-green-700 border-green-200", label: "Accepted", icon: FaCheckCircle },
  rejected: { color: "bg-red-50 text-red-700 border-red-200", label: "Rejected", icon: FaTimesCircle },
};

export default function MyOffers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const apiBaseUrl = getApiBaseUrl();

  const [activeFilter, setActiveFilter] = useState("all");

  const { data: offers = [], isLoading, isError } = useQuery({
    queryKey: ["myOffers"],
    queryFn: async () => {
      const res = await getMyOffers();
      return res.data.data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("accessToken");
    const socket = io(
      apiBaseUrl,
      {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
      }
    );

    socket.on("data_updated", () => {
      queryClient.invalidateQueries(["myOffers"]); // Auto refresh when resident accepts/rejects
    });

    return () => socket.disconnect();
  }, [queryClient, user, apiBaseUrl]);

  if (!user) { navigate("/login"); return null; }

  const filtered = activeFilter === "all" ? offers : offers.filter((o) => o.status === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* ── HEADER SECTION ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">My Offers</h1>
            <p className="text-gray-500 text-sm md:text-base">Track your submitted job quotes</p>
          </div>
          <Link 
            to="/provider/available-jobs" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow-500 text-gray-900 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
          >
            Find More Jobs
          </Link>
        </div>

        {/* ── FILTER TABS ── */}
        <div className="inline-flex p-1.5 bg-gray-200/60 rounded-2xl overflow-x-auto w-full sm:w-auto">
          {[
            { key: "all", label: "All Offers" }, 
            { key: "pending", label: "Pending" }, 
            { key: "accepted", label: "Accepted" }, 
            { key: "rejected", label: "Rejected" }
          ].map((f) => (
            <button 
              key={f.key} 
              onClick={() => setActiveFilter(f.key)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeFilter === f.key 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── ERROR/LOADING STATES ── */}
        {isError && (
          <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-center gap-3">
            <FaTimesCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
            <p className="text-red-700 font-medium">Failed to load offers. Please try refreshing.</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="w-10 h-10 text-yellow-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          
          /* ── EMPTY STATE ── */
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaClipboardList className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Offers Found</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
              You haven't submitted any offers that match this filter. Browse available jobs and start earning.
            </p>
            <Link 
              to="/provider/available-jobs" 
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-100/80 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-sm"
            >
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          
          /* ── OFFERS LIST ── */
          <div className="grid gap-5">
            {filtered.map((offer, index) => {
              const statusConf = offerStatusConfig[offer.status] || offerStatusConfig.pending;
              const StatusIcon = statusConf.icon;
              const booking = offer.booking;
              const comm = calculateCommission(offer.laborEstimate || 0);

              return (
                <motion.div
                  key={offer._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
                  className={`bg-white rounded-3xl p-6 md:p-8 shadow-sm border transition-all ${
                    offer.status === "accepted" ? "border-green-200 bg-green-50/10" : "border-gray-100"
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* Content Section */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                          {booking?.description || "Job description unavailable"}
                        </h3>
                        <span className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusConf.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConf.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-2">
                          <FaCalendarDay className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {new Date(offer.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                          <span className="font-medium line-clamp-1 max-w-[200px]">
                            {booking?.address || "Location unavailable"}
                          </span>
                        </div>
                      </div>

                      {offer.message && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                          <p className="text-sm text-gray-600 italic">"{offer.message}"</p>
                        </div>
                      )}

                      <div className="mt-auto grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Your Quote</p>
                          <p className="font-black text-gray-800 text-lg leading-none">
                            Rs. {offer.laborEstimate?.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-green-600 mb-1">Net Earning</p>
                          <p className="font-black text-green-700 text-lg leading-none">
                            Rs. {comm.providerKeeps.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      {offer.status === "accepted" && booking?._id && (
                        <div className="mt-6 pt-5 border-t border-gray-100 flex justify-end">
                          <Link 
                            to={`/provider/job/${booking._id}`} 
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition flex-shrink-0"
                          >
                            View Working Job <FaChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}