import React from "react";
import { FaCalendarAlt, FaChartLine, FaMoneyBillWave } from "react-icons/fa";

const EarningsSummary = ({ today, thisWeek, thisMonth }) => {
  const stats = [
    { label: "Revenue Today", value: today, icon: FaCalendarAlt, color: "text-blue-600", bg: "bg-blue-50", iconBg: "bg-blue-100" },
    { label: "Weekly Revenue", value: thisWeek, icon: FaChartLine, color: "text-emerald-600", bg: "bg-emerald-50", iconBg: "bg-emerald-100" },
    { label: "Monthly Revenue", value: thisMonth, icon: FaMoneyBillWave, color: "text-purple-600", bg: "bg-purple-50", iconBg: "bg-purple-100" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 border border-white shadow-sm hover:shadow-md transition-all group`}>
          <div className={`w-10 h-10 sm:w-14 sm:h-14 ${s.iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
            <s.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${s.color}`} />
          </div>
          <div>
            <h3 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">Rs. {s.value.toLocaleString()}</h3>
            <p className="text-[10px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EarningsSummary;
