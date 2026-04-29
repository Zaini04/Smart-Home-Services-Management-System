import React from "react";
import { FaMoneyBillWave, FaClipboardList, FaUsers, FaStar } from "react-icons/fa";

const AnalyticsSummary = ({ summary }) => {
  const items = [
    {
      label: "30-Day Revenue",
      value: `Rs. ${summary.totalRevenue.toLocaleString()}`,
      icon: FaMoneyBillWave,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Total Bookings",
      value: summary.totalBookings.toLocaleString(),
      icon: FaClipboardList,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Repeat Customers",
      value: summary.repeatCustomers,
      icon: FaUsers,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Retention Rate",
      value: summary.retentionRate,
      icon: FaStar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-3">
            <div className={`w-12 h-12 rounded-2xl ${item.bgColor} ${item.color} flex items-center justify-center text-xl`}>
              <item.icon />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
              <h3 className="text-2xl font-black text-gray-900">{item.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsSummary;
