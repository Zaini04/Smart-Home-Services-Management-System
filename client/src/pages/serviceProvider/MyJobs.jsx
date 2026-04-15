import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  FaClipboardList, FaSpinner, FaClock, FaCheckCircle, FaTimesCircle,
  FaTools, FaUser, FaPhone, FaMapMarkerAlt, FaArrowRight,
} from "react-icons/fa";
import { getMyJobs } from "../../api/serviceProviderEndPoints";
import { buildMediaUrl, getApiBaseUrl } from "../../utils/url";

const statusConfig = {
  inspection_pending: { color: "bg-yellow-100 text-yellow-700", label: "Inspection Pending", icon: FaClock },
  inspection_scheduled: { color: "bg-orange-100 text-orange-700", label: "Inspection Scheduled", icon: FaClock },
  awaiting_price_approval: { color: "bg-amber-100 text-amber-700", label: "Awaiting Approval", icon: FaClock },
  price_approved: { color: "bg-teal-100 text-teal-700", label: "Price Approved", icon: FaCheckCircle },
  work_in_progress: { color: "bg-indigo-100 text-indigo-700", label: "In Progress", icon: FaSpinner },
  completed: { color: "bg-green-100 text-green-700", label: "Completed", icon: FaCheckCircle },
  cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled", icon: FaTimesCircle },
};

const activeStatuses = ["inspection_pending", "inspection_scheduled", "awaiting_price_approval", "price_approved", "work_in_progress"];

export default function MyJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const apiBaseUrl = getApiBaseUrl();

  const [activeFilter, setActiveFilter] = useState("all");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["myJobs"],
    queryFn: async () => {
      const res = await getMyJobs();
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
      queryClient.invalidateQueries(["myJobs"]); // Auto refresh
    });

    return () => socket.disconnect();
  }, [queryClient, user, apiBaseUrl]);

  if (!user) { navigate("/login"); return null; }

  const filtered = activeFilter === "all" ? jobs
    : activeFilter === "active" ? jobs.filter((j) => activeStatuses.includes(j.status))
    : jobs.filter((j) => j.status === activeFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
            <p className="text-gray-500 text-sm">{isLoading ? "Loading..." : `${filtered.length} jobs`}</p>
          </div>
          <Link to="/provider/available-jobs" className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all">
            Find More Jobs
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6 flex gap-1 overflow-x-auto">
          {[{ key: "all", label: "All Jobs" }, { key: "active", label: "Active" }, { key: "completed", label: "Completed" }, { key: "cancelled", label: "Cancelled" }].map((f) => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
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
            <FaTools className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Jobs Found</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((job) => {
              const conf = statusConfig[job.status] || statusConfig.inspection_pending;
              const StatusIcon = conf.icon;
              return (
                <Link key={job._id} to={`/provider/job/${job._id}`} className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {job.images?.[0] ? <img src={buildMediaUrl(job.images[0])} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FaClipboardList className="w-7 h-7 text-gray-400" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{job.category?.name || "General"}</span>
                        <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${conf.color}`}>
                          <StatusIcon className={`w-3 h-3 ${job.status === "work_in_progress" ? "animate-spin" : ""}`} /> {conf.label}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800 line-clamp-1 text-sm mb-1">{job.description}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <FaMapMarkerAlt className="text-gray-400" /><span className="line-clamp-1">{job.address}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        {job.finalPrice?.totalAmount > 0 ? (
                          <span className="text-sm font-bold text-gray-800">Rs. {job.finalPrice.totalAmount.toLocaleString()}</span>
                        ) : <span className="text-xs text-gray-400">Price TBD</span>}
                        <span className="text-blue-600 text-xs font-medium flex items-center gap-1">
                          View Details <FaArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}