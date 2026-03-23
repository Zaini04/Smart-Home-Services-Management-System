import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../../context/SocketContext"; // Adjust path to your context
import { getAdminDashboardStats } from "../../api/adminEndPoints"; // Adjust path to api
import {
  FaUserClock,
  FaUserCheck,
  FaClipboardList,
  FaMoneyBillWave,
  FaArrowRight,
  FaCheckCircle,
  FaSpinner,
  FaChartLine,
  FaUsers,
  FaTags,
  FaWallet,
  FaExclamationCircle,
  FaClock
} from "react-icons/fa";

/* ------------------ ANIMATED NUMBER COMPONENT ------------------ */
const AnimatedNumber = ({ value, prefix = "", suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [colorClass, setColorClass] = useState("text-gray-900");

  useEffect(() => {
    if (value > displayValue) {
      setColorClass("text-green-500 scale-110 transition-all duration-300");
    } else if (value < displayValue) {
      setColorClass("text-red-500 scale-90 transition-all duration-300");
    }
    
    setDisplayValue(value);
    
    const timeout = setTimeout(() => {
      setColorClass("text-gray-900 scale-100 transition-all duration-500");
    }, 600);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <span className={`inline-block font-bold ${colorClass}`}>
      {prefix}{Number(displayValue).toLocaleString()}{suffix}
    </span>
  );
};

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

/* ------------------ MAIN DASHBOARD COMPONENT ------------------ */
export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Fetch Data using React Query
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const res = await getAdminDashboardStats();
      return res.data.data;
    },
    refetchOnWindowFocus: true,
  });

  // Listen for real-time socket updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      console.log("Real-time update received! Refreshing dashboard...");
      // This tells React Query to refetch the data in the background instantly
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    };

    socket.on("data_updated", handleUpdate);

    return () => {
      socket.off("data_updated", handleUpdate);
    };
  }, [socket, queryClient]);

  if (isLoading || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium animate-pulse">Syncing live data...</p>
      </div>
    );
  }

  // Quick actions without service-related stuff
  const quickActions = [
    {
      icon: FaTags,
      title: "Categories",
      description: "Manage service categories",
      linkTo: "/admin/create-category",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
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
      icon: FaMoneyBillWave,
      title: "Platform Earnings",
      description: "View revenue & transactions",
      linkTo: "/admin/platform-earnings",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      icon: FaChartLine,
      title: "Analytics",
      description: "Detailed system reports",
      linkTo: "/admin/analytics",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Platform overview and real-time statistics</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-2 rounded-full shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-medium text-green-700">Live Updates Active</span>
        </div>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaWallet className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-md">Today: Rs. {dashboardData.earnings.today}</div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">
              <AnimatedNumber value={dashboardData.wallet.totalEarnings} prefix="Rs. " />
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Platform Revenue</p>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaUsers className="w-7 h-7 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold"><AnimatedNumber value={dashboardData.users.total} /></p>
            <p className="text-sm text-gray-500 mt-1">Total Users</p>
            <p className="text-xs text-blue-500 mt-1 font-medium bg-blue-50 w-fit px-2 py-0.5 rounded">
              Residents: <AnimatedNumber value={dashboardData.users.residents} />
            </p>
          </div>
        </div>

        {/* Total Workers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaUserCheck className="w-7 h-7 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold"><AnimatedNumber value={dashboardData.providers.total} /></p>
            <p className="text-sm text-gray-500 mt-1">Total Workers</p>
            <p className="text-xs text-purple-500 mt-1 font-medium bg-purple-50 w-fit px-2 py-0.5 rounded">
              Approved: <AnimatedNumber value={dashboardData.providers.approved} />
            </p>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaClipboardList className="w-7 h-7 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold"><AnimatedNumber value={dashboardData.bookings.total} /></p>
            <p className="text-sm text-gray-500 mt-1">Total Bookings</p>
            <p className="text-xs text-orange-500 mt-1 font-medium bg-orange-50 w-fit px-2 py-0.5 rounded">
              Active Now: <AnimatedNumber value={dashboardData.bookings.active} />
            </p>
          </div>
        </div>

      </div>

      {/* 3. Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* 4. Bottom Grids (Recent Activity & Pending KYC) */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Table (Takes up 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaClock className="text-blue-500"/> Recent Bookings
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {dashboardData.lists.recentActivities.length === 0 ? (
              <p className="p-8 text-center text-gray-500">No recent activities found.</p>
            ) : (
              dashboardData.lists.recentActivities.map((activity) => (
                <div key={activity._id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                      {activity.resident?.profileImage ? (
                        <img src={activity.resident.profileImage} alt="" className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                          {activity.resident?.full_name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{activity.category?.name || "Service Request"}</p>
                      <p className="text-xs text-gray-500">By: {activity.resident?.full_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 rounded-md text-gray-600 uppercase tracking-wide">
                      {activity.status.replace(/_/g, " ")}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                      {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Workers List (Takes up 1 column) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-amber-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2">
              <FaExclamationCircle /> Action Required
            </h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
              <AnimatedNumber value={dashboardData.providers.pending} /> Pending
            </span>
          </div>
          
          <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
            {dashboardData.lists.pendingWorkers.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-gray-400 h-full">
                <FaCheckCircle className="text-4xl text-green-300 mb-3" />
                <p className="font-medium text-gray-600">All caught up!</p>
                <p className="text-xs text-center mt-1">No workers are pending approval.</p>
              </div>
            ) : (
              dashboardData.lists.pendingWorkers.map((worker) => (
                <Link 
                  key={worker._id} 
                  to={`/admin/update-kyc/${worker._id}`} 
                  className="p-4 flex items-center justify-between hover:bg-amber-50/30 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                      {worker.userId?.profileImage ? (
                        <img src={worker.userId.profileImage} alt="" className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-700 font-bold">
                          {worker.userId?.full_name?.charAt(0) || "W"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800 group-hover:text-amber-700 transition">
                        {worker.userId?.full_name || "Unknown"}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{worker.userId?.phone}</p>
                    </div>
                  </div>
                  <button className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded font-medium group-hover:bg-amber-500 group-hover:text-white transition">
                    Review
                  </button>
                </Link>
              ))
            )}
          </div>
          
          {dashboardData.providers.pending > 5 && (
            <div className="p-3 text-center border-t border-gray-100 bg-gray-50 mt-auto">
               <Link to="/admin/pending-workers" className="text-blue-600 font-semibold text-sm hover:underline">
                  View all {dashboardData.providers.pending} pending workers &rarr;
               </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}