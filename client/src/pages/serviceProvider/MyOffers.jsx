import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  FaClipboardList, FaSpinner, FaClock, FaCheckCircle, FaTimesCircle,
  FaMapMarkerAlt, FaArrowRight, FaExclamationTriangle,
} from "react-icons/fa";
import { getMyOffers } from "../../api/serviceProviderEndPoints";
import { calculateCommission } from "../../utils/commissionCalc";

const offerStatusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-700", label: "Pending", icon: FaClock },
  accepted: { color: "bg-green-100 text-green-700", label: "Accepted", icon: FaCheckCircle },
  rejected: { color: "bg-red-100 text-red-700", label: "Rejected", icon: FaTimesCircle },
};

export default function MyOffers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState("all");

  const { data: offers = [], isLoading } = useQuery({
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
      import.meta.env.VITE_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000",
      {
      auth: { token },
      withCredentials: true,
      }
    );

    socket.on("data_updated", () => {
      queryClient.invalidateQueries(["myOffers"]); // Auto refresh when resident accepts/rejects
    });

    return () => socket.disconnect();
  }, [queryClient, user]);

  if (!user) { navigate("/login"); return null; }

  const filtered = activeFilter === "all" ? offers : offers.filter((o) => o.status === activeFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Offers</h1>
            <p className="text-gray-500 text-sm">Track your submitted offers</p>
          </div>
          <Link to="/provider/available-jobs" className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all">
            Browse Jobs
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6 flex gap-1">
          {[{ key: "all", label: "All" }, { key: "pending", label: "Pending" }, { key: "accepted", label: "Accepted" }, { key: "rejected", label: "Rejected" }].map((f) => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === f.key ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><FaSpinner className="w-10 h-10 text-blue-500 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <FaClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Offers Found</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((offer) => {
              const statusConf = offerStatusConfig[offer.status] || offerStatusConfig.pending;
              const StatusIcon = statusConf.icon;
              const booking = offer.booking;
              const comm = calculateCommission(offer.laborEstimate || 0);

              return (
                <div key={offer._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 line-clamp-2 text-sm">{booking?.description || "Job description"}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <FaMapMarkerAlt className="text-gray-400" /> {booking?.address || "No address"}
                      </div>
                    </div>
                    <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConf.color}`}>
                      <StatusIcon className="w-3 h-3" /> {statusConf.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Your Quote</p>
                      <p className="font-bold text-gray-800">Rs. {offer.laborEstimate?.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Your Earning</p>
                      <p className="font-bold text-green-700">Rs. {comm.providerKeeps.toLocaleString()}</p>
                    </div>
                  </div>

                  {offer.message && (
                    <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg p-2.5 mb-3">"{offer.message}"</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {new Date(offer.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {offer.status === "accepted" && booking?._id && (
                      <Link to={`/provider/job/${booking._id}`} className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all">
                        View Job <FaArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}