import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FaHome,
  FaSearch,
  FaBell,
  FaBriefcase,
  FaWallet,
  FaUser,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
  FaTools,
  FaMoneyBillWave,
  FaSpinner,
  FaClipboardList,
  FaStar,
  FaTimesCircle,
} from "react-icons/fa";
import { getProviderDashboard } from "../../api/serviceProviderEndPoints";
import { buildMediaUrl } from "../../utils/url";

/* ── Status config ── */
const jobStatusConfig = {
  inspection_pending: { color: "bg-yellow-50 text-yellow-700 border border-yellow-200", label: "Inspection Pending", icon: FaClock },
  inspection_scheduled: { color: "bg-orange-50 text-orange-700 border border-orange-200", label: "Inspection Scheduled", icon: FaClock },
  awaiting_price_approval: { color: "bg-amber-50 text-amber-700 border border-amber-200", label: "Awaiting Approval", icon: FaClock },
  price_approved: { color: "bg-teal-50 text-teal-700 border border-teal-200", label: "Price Approved", icon: FaCheckCircle },
  work_in_progress: { color: "bg-purple-50 text-purple-700 border border-purple-200", label: "In Progress", icon: FaSpinner },
  completed: { color: "bg-green-50 text-green-700 border border-green-200", label: "Completed", icon: FaCheckCircle },
  cancelled: { color: "bg-red-50 text-red-700 border border-red-200", label: "Cancelled", icon: FaTimesCircle },
};

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, loading, colorScheme }) {
  const colorMap = {
    yellow: "bg-yellow-500 shadow-yellow-500/20 text-white",
    gray: "bg-gray-800 shadow-gray-800/20 text-white"
  };
  
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-2xl ${colorMap[colorScheme] || colorMap.gray} flex items-center justify-center mb-4 shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-3xl font-black text-gray-900 leading-tight">{value}</p>
      )}
      <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function ServiceProviderDashboard() {
  const { data, isLoading: loading, isError } = useQuery({
    queryKey: ["providerDashboard"],
    queryFn: async () => {
      const res = await getProviderDashboard();
      return res.data.data;
    },
  });

  const stats = data?.stats || {};
  const provider = data?.provider || {};
  console.log("Dashboard Data:", data);
  const recentJobsRaw = data?.recentJobs || [];
  console.log("Recent Jobs:", recentJobsRaw);
  
  // Filter top 5 recent jobs that are NOT completed and NOT cancelled
  const activeRecentJobs = recentJobsRaw
    .filter(j => !["completed", "cancelled"].includes(j.status))
    .slice(0, 5);

  const statCards = [
    { icon: FaBriefcase, label: "Total Jobs", value: stats.totalJobs ?? 0, colorScheme: "gray" },
    { icon: FaTools, label: "Active Jobs", value: stats.activeJobs ?? 0, colorScheme: "yellow" },
    { icon: FaCheckCircle, label: "Completed", value: stats.completedJobs ?? 0, colorScheme: "gray" },
    { icon: FaSearch, label: "Available Jobs", value: stats.availableJobs ?? 0, colorScheme: "gray" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto py-2">

      {/* ── Welcome Hero (Dark Mode Style) ── */}
      <div className="bg-gray-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full blur-[100px] opacity-10 pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-gray-400 font-medium mb-1">Welcome back,</p>
            {loading ? (
              <div className="h-10 w-48 bg-white/10 rounded-xl animate-pulse mt-1 mb-2" />
            ) : (
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                {provider.name || "Provider"}
              </h2>
            )}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5 border border-white/5 shadow-inner">
                <FaStar className="text-yellow-400 w-4 h-4" />
                <span className="font-bold text-sm">
                  {provider.rating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-gray-400 text-xs font-medium">
                  ({provider.ratingCount || 0} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5 border border-white/5 shadow-inner">
                <FaCheckCircle className="text-green-400 w-4 h-4" />
                <span className="text-sm font-bold text-gray-200">
                  {stats.completedJobs || 0} completed
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/provider/available-jobs"
            className="flex items-center justify-center gap-2 bg-yellow-500 text-gray-900 px-6 py-3.5 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20 text-sm md:text-base flex-shrink-0"
          >
            <FaSearch className="w-4 h-4" />
            Find New Jobs
          </Link>
        </div>

        {/* Wallet strip */}
        <div className="mt-8 bg-black/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 backdrop-blur-md relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700 shadow-inner flex-shrink-0">
              <FaWallet className="text-yellow-500 w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-0.5">Wallet Balance</p>
              {loading ? (
                <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" />
              ) : (
               <p className="font-black text-2xl tracking-tight">
                 Rs. {(data?.wallet?.balance || 0).toLocaleString()}
               </p>
              )}
            </div>
          </div>
          <Link
            to="/provider/wallet"
            className="text-gray-400 text-sm font-bold flex items-center gap-1.5 hover:text-white transition-colors py-2"
          >
            Manage Wallet
            <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <h3 className="font-bold text-xl text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: "/provider/available-jobs", icon: FaSearch, label: "Find Jobs" },
            { to: "/provider/my-offers", icon: FaBell, label: "My Offers" },
            { to: "/provider/my-jobs", icon: FaBriefcase, label: "My Tasks" },
            { to: "/provider/wallet", icon: FaWallet, label: "Wallet" },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <action.icon className="w-4 h-4 text-gray-700" />
              </div>
              <span className="font-bold text-sm text-gray-800">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Active Jobs ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-xl text-gray-900">Your Active Jobs</h3>
            <p className="text-gray-500 text-sm mt-1">Recently assigned tasks that need your attention</p>
          </div>
          <Link
            to="/provider/my-jobs"
            className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-800 transition-all bg-blue-50 px-4 py-2 rounded-xl"
          >
            View All <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : activeRecentJobs.length === 0 ? (
          <div className="text-center py-12 px-4 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-200">
              <FaCheckCircle className="w-6 h-6 text-gray-300" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">No Active Tasks</h4>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              You are all caught up! You don't have any ongoing or scheduled jobs at the moment.
            </p>
            <Link
              to="/provider/available-jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
            >
              <FaSearch className="w-3.5 h-3.5" />
              Find New Work
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeRecentJobs.map((job) => {
              const conf = jobStatusConfig[job.status] || jobStatusConfig.inspection_pending;
              const StatusIcon = conf.icon;

              return (
                <Link
                  key={job._id}
                  to={`/provider/job/${job._id}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group bg-white"
                >
                  {/* Image */}
                  <div className="w-full sm:w-16 h-40 sm:h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 relative">
                    {job.images?.[0] ? (
                      <img src={buildMediaUrl(job.images[0])} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaClipboardList className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base sm:text-sm line-clamp-1 group-hover:text-blue-600 transition-colors mb-1.5">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-3">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                        <FaUser className="w-3 h-3 text-gray-400" />
                        {job.resident?.name || "Client"}
                      </span>
                      {job.finalPrice?.totalAmount > 0 && (
                        <span className="text-xs font-black text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md">
                          Rs. {job.finalPrice.totalAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-4 sm:w-48">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold items-center gap-1.5 shadow-sm ${conf.color}`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${job.status === "work_in_progress" ? "animate-spin" : ""}`} />
                      <span className="hidden xl:inline lg:hidden 2xl:inline">{conf.label}</span>
                    </span>
                    <FaArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors sm:hidden" />
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