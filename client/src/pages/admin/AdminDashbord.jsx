import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaTools,
  FaUserClock,
  FaUserCheck,
  FaClipboardList,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaStar,
  FaEye,
  FaSpinner,
  FaChartLine,
  FaUsers,
  FaCalendarAlt,
  FaTags ,
} from "react-icons/fa";

/* ------------------ STAT CARD COMPONENT ------------------ */

const StatCard = ({ icon: Icon, label, value, change, changeType, color, bgColor, iconBg }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-7 h-7 ${color}`} />
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${
          changeType === "up" 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {changeType === "up" ? (
            <FaArrowUp className="w-3 h-3" />
          ) : (
            <FaArrowDown className="w-3 h-3" />
          )}
          {change}%
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  </div>
);

/* ------------------ QUICK ACTION CARD ------------------ */

const QuickActionCard = ({ icon: Icon, title, description, linkTo, color, bgColor }) => (
  <Link
    to={linkTo}
    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group block"
  >
    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
      {title}
    </h3>
    <p className="text-sm text-gray-500">{description}</p>
    <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium text-sm">
      Go to {title}
      <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

/* ------------------ RECENT ACTIVITY ITEM ------------------ */

const ActivityItem = ({ icon: Icon, title, description, time, color }) => (
  <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 truncate">{description}</p>
    </div>
    <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{time}</span>
  </div>
);

/* ------------------ PENDING WORKER CARD ------------------ */

const PendingWorkerCard = ({ worker, onView }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
        {worker.name?.charAt(0) || "U"}
      </div>
      <div>
        <p className="font-medium text-gray-900">{worker.name}</p>
        <p className="text-sm text-gray-500">{worker.category}</p>
      </div>
    </div>
    <button
      onClick={() => onView(worker)}
      className="p-2 hover:bg-white rounded-lg transition-colors"
    >
      <FaEye className="w-4 h-4 text-gray-500" />
    </button>
  </div>
);

/* ------------------ MAIN COMPONENT ------------------ */

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalServices: 0,
    pendingProviders: 0,
    approvedProviders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    // Simulate fetching stats
    const fetchStats = async () => {
      try {
        // Replace with actual API call
        // const res = await getAdminStats();
        // setStats(res.data);

        // Mock data
        setTimeout(() => {
          setStats({
            totalServices: 156,
            pendingProviders: 24,
            approvedProviders: 523,
            totalBookings: 8934,
            totalRevenue: 2345600,
            totalUsers: 12458,
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      icon: FaTools,
      label: "Total Services",
      value: loading ? "—" : stats.totalServices.toLocaleString(),
      change: 12,
      changeType: "up",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      iconBg: "bg-blue-100",
    },
    {
      icon: FaUserClock,
      label: "Pending Providers",
      value: loading ? "—" : stats.pendingProviders.toLocaleString(),
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      iconBg: "bg-amber-100",
    },
    {
      icon: FaUserCheck,
      label: "Approved Providers",
      value: loading ? "—" : stats.approvedProviders.toLocaleString(),
      change: 8,
      changeType: "up",
      color: "text-green-600",
      bgColor: "bg-green-100",
      iconBg: "bg-green-100",
    },
    {
      icon: FaUsers,
      label: "Total Users",
      value: loading ? "—" : stats.totalUsers.toLocaleString(),
      change: 15,
      changeType: "up",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      iconBg: "bg-purple-100",
    },
  ];

  const quickActions = [
    {
      icon: FaTools,
      title: "Add Service",
      description: "Create a new service listing",
      linkTo: "/admin/add-service",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
  icon: FaMoneyBillWave,
  title: "Platform Earnings",
  description: "View commission & revenue",
  linkTo: "/admin/platform-earnings",
  color: "text-emerald-600",
  bgColor: "bg-emerald-100",
},
    {
      icon: FaTags,
      title: "Categories",
      description: "Manage service categories",
      linkTo: "/admin/create-category",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: FaUserClock,
      title: "Pending KYC",
      description: "Review pending workers",
      linkTo: "/admin/pending-workers",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      icon: FaChartLine,
      title: "Analytics",
      description: "View detailed reports",
      linkTo: "/admin/analytics",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const recentActivities = [
    {
      icon: FaCheckCircle,
      title: "New booking completed",
      description: "AC Repair service by Ahmed Khan",
      time: "2 min ago",
      color: "bg-green-500",
    },
    {
      icon: FaUserCheck,
      title: "Provider approved",
      description: "Usman Ali - Electrician",
      time: "15 min ago",
      color: "bg-blue-500",
    },
    {
      icon: FaClock,
      title: "KYC pending review",
      description: "Bilal Hassan submitted documents",
      time: "1 hour ago",
      color: "bg-amber-500",
    },
    {
      icon: FaStar,
      title: "New 5-star review",
      description: "Customer rated Faisal Malik",
      time: "2 hours ago",
      color: "bg-yellow-500",
    },
    {
      icon: FaTimesCircle,
      title: "Booking cancelled",
      description: "Plumbing service in DHA",
      time: "3 hours ago",
      color: "bg-red-500",
    },
  ];

  const pendingWorkers = [
    { id: 1, name: "Muhammad Ali", category: "Electrician" },
    { id: 2, name: "Hassan Raza", category: "Plumber" },
    { id: 3, name: "Kamran Ahmed", category: "AC Technician" },
    { id: 4, name: "Imran Khan", category: "Carpenter" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <FaSpinner className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, Admin! 👋
          </h1>
          <p className="text-blue-100 max-w-xl">
            Here's what's happening with your platform today. You have{" "}
            <span className="font-semibold text-white">{stats.pendingProviders} pending</span> KYC
            requests to review.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              to="/admin/pending-workers"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
            >
              Review Pending
              <FaArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/admin/add-service"
              className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 border border-white/30"
            >
              Add Service
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </div>

        {/* Pending Workers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Pending Workers</h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
              {stats.pendingProviders}
            </span>
          </div>
          <div className="p-4 space-y-3">
            {pendingWorkers.map((worker) => (
              <PendingWorkerCard
                key={worker.id}
                worker={worker}
                onView={() => {}}
              />
            ))}
          </div>
          <div className="p-4 border-t border-gray-100">
            <Link
              to="/admin/pending-workers"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              Review All
              <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaMoneyBillWave className="w-8 h-8" />
              <h2 className="text-xl font-bold">Total Revenue</h2>
            </div>
            <p className="text-4xl font-bold mb-2">
              PKR {(stats.totalRevenue / 1000000).toFixed(2)}M
            </p>
            <p className="text-emerald-100">+23% from last month</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/20 rounded-2xl p-4">
              <p className="text-emerald-100 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.totalBookings.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4">
              <p className="text-emerald-100 text-sm">Avg. Order Value</p>
              <p className="text-2xl font-bold">PKR 2,450</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}