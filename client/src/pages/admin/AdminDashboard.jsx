import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../../context/SocketContext";
import { getAdminDashboardStats } from "../../api/adminEndPoints";
import {
  FaUserClock,
  FaMoneyBillWave,
  FaSpinner,
  FaChartLine,
  FaTags,
} from "react-icons/fa";

// Dashboard Components
import StatsGrid from "../../components/admin/dashboard/StatsGrid";
import QuickActionCard from "../../components/admin/dashboard/QuickActionCard";
import RecentBookings from "../../components/admin/dashboard/RecentBookings";
import PendingWorkers from "../../components/admin/dashboard/PendingWorkers";

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

  // Quick actions
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
      <StatsGrid data={dashboardData} />

      {/* 3. Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* 4. Bottom Grids */}
      <div className="grid lg:grid-cols-3 gap-8">
        <RecentBookings bookings={dashboardData.lists.recentActivities} />
        <PendingWorkers 
          workers={dashboardData.lists.pendingWorkers} 
          totalPending={dashboardData.providers.pending} 
        />
      </div>
    </div>
  );
}