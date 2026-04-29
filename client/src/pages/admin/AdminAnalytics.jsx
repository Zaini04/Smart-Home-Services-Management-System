import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FaChartLine, FaSpinner } from "react-icons/fa";
import { getComprehensiveAnalytics } from "../../api/adminEndPoints";

// Components
import AnalyticsSummary from "../../components/admin/analytics/AnalyticsSummary";
import RevenueTrendChart from "../../components/admin/analytics/RevenueTrendChart";
import UserGrowthChart from "../../components/admin/analytics/UserGrowthChart";
import AiInsights from "../../components/admin/analytics/AiInsights";
import BookingStatusPie from "../../components/admin/analytics/BookingStatusPie";
import TopProvidersTable from "../../components/admin/analytics/TopProvidersTable";

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: async () => {
      const res = await getComprehensiveAnalytics();
      return res.data.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium tracking-wide">Crunching your platform data...</p>
      </div>
    );
  }

  const { summary, charts, providers, insights } = analytics;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
              <FaChartLine className="text-white w-6 h-6" />
            </div>
            Platform Analytics
          </h1>
          <p className="text-gray-500 font-medium mt-2">Deep dive into revenue, growth, and user behavior trends.</p>
        </div>
      </div>

      <AnalyticsSummary summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueTrendChart data={charts.timeline} />
        <UserGrowthChart data={charts.timeline} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AiInsights insights={insights} />
        </div>
        <div className="lg:col-span-1">
          <BookingStatusPie data={charts.bookingStatus} />
        </div>
      </div>

      <TopProvidersTable providers={providers.top} />
      
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}