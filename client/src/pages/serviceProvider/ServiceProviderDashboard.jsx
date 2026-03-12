import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

/* ── Status config ── */
const jobStatusConfig = {
  inspection_pending: {
    color: "bg-yellow-100 text-yellow-700",
    label: "Inspection Pending",
    icon: FaClock,
  },
  inspection_scheduled: {
    color: "bg-orange-100 text-orange-700",
    label: "Inspection Scheduled",
    icon: FaClock,
  },
  awaiting_price_approval: {
    color: "bg-amber-100 text-amber-700",
    label: "Awaiting Approval",
    icon: FaClock,
  },
  price_approved: {
    color: "bg-teal-100 text-teal-700",
    label: "Price Approved",
    icon: FaCheckCircle,
  },
  work_in_progress: {
    color: "bg-indigo-100 text-indigo-700",
    label: "In Progress",
    icon: FaSpinner,
  },
  completed: {
    color: "bg-green-100 text-green-700",
    label: "Completed",
    icon: FaCheckCircle,
  },
  cancelled: {
    color: "bg-red-100 text-red-700",
    label: "Cancelled",
    icon: FaTimesCircle,
  },
};

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, iconBg, loading }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div
        className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4 shadow-sm`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      {loading ? (
        <div className="h-7 w-20 bg-gray-200 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

/* ── Main ── */
export default function ServiceProviderDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getProviderDashboard();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {};
  const provider = data?.provider || {};
  const recentJobs = data?.recentJobs || [];

  const statCards = [
    {
      icon: FaBriefcase,
      label: "Total Jobs",
      value: stats.totalJobs ?? 0,
      iconBg: "bg-blue-500",
    },
    {
      icon: FaTools,
      label: "Active Jobs",
      value: stats.activeJobs ?? 0,
      iconBg: "bg-purple-500",
    },
    {
      icon: FaCheckCircle,
      label: "Completed",
      value: stats.completedJobs ?? 0,
      iconBg: "bg-green-500",
    },
    {
      icon: FaBell,
      label: "Pending Offers",
      value: stats.pendingOffers ?? 0,
      iconBg: "bg-amber-500",
    },
    {
      icon: FaSearch,
      label: "Available Jobs",
      value: stats.availableJobs ?? 0,
      iconBg: "bg-indigo-500",
    },
    {
      icon: FaMoneyBillWave,
      label: "Today's Earnings",
      value: `Rs. ${(stats.todayEarnings ?? 0).toLocaleString()}`,
      iconBg: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-8">

      {/* ── Welcome Hero ── */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-100 text-sm">Welcome back,</p>
            {loading ? (
              <div className="h-8 w-40 bg-white/20 rounded-lg animate-pulse mt-1 mb-2" />
            ) : (
              <h2 className="text-2xl font-bold mt-0.5">
                {provider.name || "Provider"}
              </h2>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                <FaStar className="text-yellow-300 w-3.5 h-3.5" />
                <span className="font-semibold text-sm">
                  {provider.rating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-blue-200 text-xs">
                  ({provider.ratingCount || 0} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                <FaCheckCircle className="text-green-300 w-3.5 h-3.5" />
                <span className="text-sm font-medium">
                  {stats.completedJobs || 0} completed
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/provider/available-jobs"
            className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-md text-sm flex-shrink-0"
          >
            <FaSearch className="w-4 h-4" />
            Find Jobs
          </Link>
        </div>

        {/* Wallet strip */}
        <div className="mt-5 bg-white/10 rounded-xl p-4 flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FaWallet className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-blue-100 text-xs">Wallet Balance</p>
              {loading ? (
                <div className="h-6 w-28 bg-white/20 rounded animate-pulse mt-0.5" />
              ) : (
               <p className="font-bold text-xl">
  Rs. {(data?.wallet?.balance || 0).toLocaleString()}
</p>
// {data?.wallet?.lockedAmount > 0 && (
//   <p className="text-blue-200 text-xs">
//     Locked: Rs. {data.wallet.lockedAmount.toLocaleString()}
//   </p>
// )}
              )}
            </div>
          </div>
          <Link
            to="/provider/earnings"
            className="text-blue-100 text-sm flex items-center gap-1.5 hover:text-white transition-colors"
          >
            View Earnings
            <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              to: "/provider/available-jobs",
              icon: FaSearch,
              label: "Find Jobs",
              iconBg: "bg-blue-600",
              cardBg: "from-blue-50 to-indigo-50 border-blue-100",
            },
            {
              to: "/provider/my-offers",
              icon: FaBell,
              label: "My Offers",
              iconBg: "bg-amber-500",
              cardBg: "from-amber-50 to-orange-50 border-amber-100",
            },
            {
              to: "/provider/my-jobs",
              icon: FaBriefcase,
              label: "My Jobs",
              iconBg: "bg-purple-600",
              cardBg: "from-purple-50 to-pink-50 border-purple-100",
            },
            {
              to: "/provider/edit-profile",
              icon: FaUser,
              label: "Edit Profile",
              iconBg: "bg-green-600",
              cardBg: "from-green-50 to-teal-50 border-green-100",
            },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl bg-gradient-to-br border-2 hover:shadow-md transition-all group ${action.cardBg}`}
            >
              <div
                className={`w-11 h-11 ${action.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}
              >
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Jobs ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800">Recent Jobs</h3>
          <Link
            to="/provider/my-jobs"
            className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="text-center py-10">
            <FaBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-3">No jobs yet</p>
            <Link
              to="/provider/available-jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <FaSearch className="w-3.5 h-3.5" />
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => {
              const conf =
                jobStatusConfig[job.status] ||
                jobStatusConfig.inspection_pending;
              const StatusIcon = conf.icon;

              return (
                <Link
                  key={job._id}
                  to={`/provider/job/${job._id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                >
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    {job.images?.[0] ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${job.images[0]}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaClipboardList className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-1">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {job.resident?.name || "Resident"}
                      </p>
                      {job.finalPrice?.totalAmount > 0 && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs font-bold text-gray-700">
                            Rs.{" "}
                            {job.finalPrice.totalAmount.toLocaleString()}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${conf.color}`}
                  >
                    <StatusIcon
                      className={`w-3 h-3 ${
                        job.status === "work_in_progress" ? "animate-spin" : ""
                      }`}
                    />
                    <span className="hidden sm:inline">{conf.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Earnings Snapshot ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Earnings Snapshot</h3>
          <Link
            to="/provider/earnings"
            className="text-blue-600 text-sm font-medium flex items-center gap-1"
          >
            Full Report <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Today",
              value: `Rs. ${(stats.todayEarnings || 0).toLocaleString()}`,
              bg: "bg-green-50",
              text: "text-green-700",
              border: "border-green-100",
            },
            {
              label: "Wallet",
              value: `Rs. ${(provider.walletBalance || 0).toLocaleString()}`,
              bg: "bg-blue-50",
              text: "text-blue-700",
              border: "border-blue-100",
            },
            {
              label: "Jobs Done",
              value: stats.completedJobs || 0,
              bg: "bg-purple-50",
              text: "text-purple-700",
              border: "border-purple-100",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`${item.bg} border ${item.border} rounded-xl p-4 text-center`}
            >
              {loading ? (
                <div className="h-6 w-16 bg-white/60 rounded animate-pulse mx-auto mb-1" />
              ) : (
                <p className={`font-bold ${item.text} text-sm`}>
                  {item.value}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}