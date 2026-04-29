import React from "react";
import { FaWallet, FaUsers, FaUserCheck, FaClipboardList } from "react-icons/fa";
import AnimatedNumber from "./AnimatedNumber";

const StatsGrid = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Revenue */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
        <div className="flex justify-between items-start">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FaWallet className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-md">
            Today: Rs. {data.earnings.today}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold">
            <AnimatedNumber value={data.wallet.totalEarnings} prefix="Rs. " />
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
          <p className="text-3xl font-bold">
            <AnimatedNumber value={data.users.total} />
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Users</p>
          <p className="text-xs text-blue-500 mt-1 font-medium bg-blue-50 w-fit px-2 py-0.5 rounded">
            Residents: <AnimatedNumber value={data.users.residents} />
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
          <p className="text-3xl font-bold">
            <AnimatedNumber value={data.providers.total} />
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Workers</p>
          <p className="text-xs text-purple-500 mt-1 font-medium bg-purple-50 w-fit px-2 py-0.5 rounded">
            Approved: <AnimatedNumber value={data.providers.approved} />
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
          <p className="text-3xl font-bold">
            <AnimatedNumber value={data.bookings.total} />
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Bookings</p>
          <p className="text-xs text-orange-500 mt-1 font-medium bg-orange-50 w-fit px-2 py-0.5 rounded">
            Active Now: <AnimatedNumber value={data.bookings.active} />
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;
