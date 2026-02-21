import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaHome,
  FaClipboardList,
  FaWallet,
  FaStar,
  FaUser,
  FaBell,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaArrowRight,
  FaTools,
  FaMoneyBillWave,
  FaExclamationCircle,
  FaSearch,
  FaBriefcase,
  FaChartLine,
  FaSpinner,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaSignOutAlt,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import { getProviderDashboard } from "../../api/serviceProviderEndPoints";

/* ─────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────── */
const menuItems = [
  {
    id: "overview",
    icon: FaHome,
    label: "Overview",
    path: null, // handled by tab
  },
  {
    id: "available",
    icon: FaSearch,
    label: "Available Jobs",
    path: "/provider/available-jobs",
  },
  {
    id: "offers",
    icon: FaBell,
    label: "My Offers",
    path: "/provider/my-offers",
  },
  {
    id: "jobs",
    icon: FaBriefcase,
    label: "My Jobs",
    path: "/provider/my-jobs",
  },
  {
    id: "earnings",
    icon: FaWallet,
    label: "Earnings",
    path: null,
  },
  {
    id: "profile",
    icon: FaUser,
    label: "Profile",
    path: "/provider/profile",
  },
];

function Sidebar({ activeTab, setActiveTab, provider, onClose, isMobile }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setActiveTab(item.id);
    }
    if (isMobile && onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex flex-col w-72 bg-white border-r border-gray-100 min-h-screen shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              {provider?.profileImage ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/${provider.profileImage}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 truncate text-sm">
                {provider?.name || "Provider"}
              </p>
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    provider?.status === "available"
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />
                <span className="text-xs text-gray-500 capitalize">
                  {provider?.status || "offline"}
                </span>
              </div>
            </div>
          </div>
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Rating Strip */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <FaStar className="text-yellow-400 w-4 h-4" />
            <span className="font-bold text-gray-800 text-sm">
              {provider?.rating?.toFixed(1) || "0.0"}
            </span>
            <span className="text-gray-400 text-xs">
              ({provider?.ratingCount || 0})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaWallet className="text-green-500 w-4 h-4" />
            <span className="font-bold text-green-600 text-sm">
              Rs. {(provider?.walletBalance || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
          Main Menu
        </p>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"
                }`}
              />
              <span className="font-medium text-sm">{item.label}</span>
              {item.id === "available" && (
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  New
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Help Card */}
      <div className="p-4 space-y-2">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center mb-2.5">
            <FaExclamationCircle className="w-4 h-4 text-white" />
          </div>
          <p className="font-semibold text-gray-800 text-sm mb-1">Need Help?</p>
          <p className="text-xs text-gray-500 mb-3">
            Contact our support team for assistance.
          </p>
          <button className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Get Support
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, iconBg, loading }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        {loading ? (
          <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   JOB STATUS CONFIG
───────────────────────────────────────── */
const jobStatusConfig = {
  inspection_pending: {
    color: "bg-yellow-100 text-yellow-700",
    label: "Inspection Pending",
  },
  inspection_scheduled: {
    color: "bg-orange-100 text-orange-700",
    label: "Inspection Scheduled",
  },
  awaiting_price_approval: {
    color: "bg-amber-100 text-amber-700",
    label: "Awaiting Approval",
  },
  price_approved: {
    color: "bg-teal-100 text-teal-700",
    label: "Price Approved",
  },
  work_in_progress: {
    color: "bg-indigo-100 text-indigo-700",
    label: "In Progress",
  },
  completed: {
    color: "bg-green-100 text-green-700",
    label: "Completed",
  },
  cancelled: {
    color: "bg-red-100 text-red-700",
    label: "Cancelled",
  },
};

/* ─────────────────────────────────────────
   OVERVIEW TAB
───────────────────────────────────────── */
function OverviewTab({ data, loading }) {
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
      sub: "Ready to bid",
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
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-100 text-sm">Welcome back,</p>
            <h2 className="text-2xl font-bold">
              {loading ? "Loading..." : provider.name || "Provider"}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-300 w-4 h-4" />
                <span className="font-semibold">
                  {provider.rating?.toFixed(1) || "0.0"}
                </span>
              </div>
              <span className="text-blue-200">•</span>
              <span className="text-blue-100 text-sm">
                {provider.ratingCount || 0} reviews
              </span>
              <span className="text-blue-200">•</span>
              <span className="text-blue-100 text-sm">
                {stats.completedJobs || 0} jobs done
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/provider/available-jobs"
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-md text-sm"
            >
              <FaSearch className="w-4 h-4" />
              Find Jobs
            </Link>
          </div>
        </div>

        {/* Wallet Strip */}
        <div className="mt-4 bg-white/10 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FaWallet className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-blue-100 text-xs">Wallet Balance</p>
              <p className="font-bold text-xl">
                Rs. {(provider.walletBalance || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <button className="text-blue-100 text-sm flex items-center gap-1 hover:text-white transition-colors">
            Withdraw <FaArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              to: "/provider/available-jobs",
              icon: FaSearch,
              label: "Find Jobs",
              color: "from-blue-50 to-indigo-50 border-blue-100 text-blue-600",
              iconBg: "bg-blue-600",
            },
            {
              to: "/provider/my-offers",
              icon: FaBell,
              label: "My Offers",
              color: "from-amber-50 to-orange-50 border-amber-100 text-amber-600",
              iconBg: "bg-amber-500",
            },
            {
              to: "/provider/my-jobs",
              icon: FaBriefcase,
              label: "My Jobs",
              color: "from-purple-50 to-pink-50 border-purple-100 text-purple-600",
              iconBg: "bg-purple-600",
            },
            {
              to: "/provider/profile",
              icon: FaUser,
              label: "My Profile",
              color: "from-green-50 to-teal-50 border-green-100 text-green-600",
              iconBg: "bg-green-600",
            },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl bg-gradient-to-br border-2 hover:shadow-md transition-all group ${action.color}`}
            >
              <div
                className={`w-11 h-11 ${action.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}
              >
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Jobs */}
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
            <p className="text-gray-500 text-sm">No jobs yet</p>
            <Link
              to="/provider/available-jobs"
              className="mt-3 inline-flex items-center gap-2 text-blue-600 text-sm font-medium"
            >
              Browse available jobs <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => {
              const conf =
                jobStatusConfig[job.status] || jobStatusConfig.inspection_pending;
              return (
                <Link
                  key={job._id}
                  to={`/provider/job/${job._id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                >
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
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
                    <p className="font-medium text-gray-800 text-sm line-clamp-1">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {job.resident?.name || "Resident"}
                      </p>
                      {job.finalPrice?.totalAmount > 0 && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs font-semibold text-gray-700">
                            Rs. {job.finalPrice.totalAmount.toLocaleString()}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${conf.color}`}
                  >
                    {conf.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   EARNINGS TAB
───────────────────────────────────────── */
function EarningsTab({ data, loading }) {
  const provider = data?.provider || {};
  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Earnings</h2>
        <p className="text-gray-500 text-sm">
          Track your income and wallet balance
        </p>
      </div>

      {/* Wallet Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-green-100 text-sm">Total Wallet Balance</p>
            {loading ? (
              <div className="h-9 w-40 bg-white/20 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold mt-1">
                Rs. {(provider.walletBalance || 0).toLocaleString()}
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <FaWallet className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 bg-white text-green-600 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors">
            Withdraw Funds
          </button>
          <button className="flex-1 py-2.5 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors">
            View History
          </button>
        </div>
      </div>

      {/* Earnings Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <FaMoneyBillWave className="w-5 h-5 text-blue-600" />
          </div>
          {loading ? (
            <div className="h-7 w-24 bg-gray-200 rounded animate-pulse mb-1" />
          ) : (
            <p className="text-xl font-bold text-gray-800">
              Rs. {(stats.todayEarnings || 0).toLocaleString()}
            </p>
          )}
          <p className="text-sm text-gray-500">Today's Earnings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <FaCheckCircle className="w-5 h-5 text-green-600" />
          </div>
          {loading ? (
            <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mb-1" />
          ) : (
            <p className="text-xl font-bold text-gray-800">
              {stats.completedJobs || 0}
            </p>
          )}
          <p className="text-sm text-gray-500">Jobs Completed</p>
        </div>
      </div>

      {/* Commission Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaShieldAlt className="text-blue-600" />
          Commission Structure
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "Platform Commission",
              value: "15% of labor cost",
              note: "Deducted from labor charges only",
              color: "text-red-600",
            },
            {
              label: "Materials",
              value: "0% commission",
              note: "Full material cost goes to you",
              color: "text-green-600",
            },
            {
              label: "Payment",
              value: "Instant to wallet",
              note: "After resident confirms payment",
              color: "text-blue-600",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  {item.label}
                </p>
                <p className="text-xs text-gray-400">{item.note}</p>
              </div>
              <span className={`font-bold text-sm ${item.color}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Example Calculation */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h4 className="font-semibold text-blue-800 mb-3 text-sm">
          💡 Example Calculation
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Labor Charge</span>
            <span className="font-medium">Rs. 2,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Material Cost</span>
            <span className="font-medium">Rs. 500</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Resident Pays Total</span>
            <span className="font-medium">Rs. 2,500</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Platform Fee (15% of Rs.2000)</span>
            <span className="text-red-600 font-medium">- Rs. 300</span>
          </div>
          <div className="flex justify-between font-bold border-t border-blue-200 pt-2">
            <span className="text-green-700">Your Earning</span>
            <span className="text-green-700">Rs. 2,200</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────── */
export default function ServiceProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getProviderDashboard();
      setDashboardData(res.data.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab data={dashboardData} loading={loading} />;
      case "earnings":
        return <EarningsTab data={dashboardData} loading={loading} />;
      default:
        return <OverviewTab data={dashboardData} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            provider={dashboardData?.provider}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative z-10">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                provider={dashboardData?.provider}
                onClose={() => setSidebarOpen(false)}
                isMobile
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Mobile Top Bar */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <FaBars className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="font-bold text-gray-800">
              {menuItems.find((m) => m.id === activeTab)?.label || "Dashboard"}
            </h1>
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100">
              {dashboardData?.provider?.profileImage ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/${dashboardData.provider.profileImage}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaUser className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-5xl mx-auto">{renderTab()}</div>
        </main>
      </div>
    </div>
  );
}