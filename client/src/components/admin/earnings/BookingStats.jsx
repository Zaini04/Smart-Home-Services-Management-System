import React from "react";

const BookingStats = ({ total, completed, active, cancelled }) => {
  const stats = [
    { label: "Total", value: total, color: "text-blue-600", bg: "bg-blue-50/50" },
    { label: "Success", value: completed, color: "text-emerald-600", bg: "bg-emerald-50/50" },
    { label: "In Progress", value: active, color: "text-amber-600", bg: "bg-amber-50/50" },
    { label: "Cancelled", value: cancelled, color: "text-red-600", bg: "bg-red-50/50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center border border-white shadow-sm`}>
          <p className={`text-xl sm:text-3xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
          <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{s.label} Bookings</p>
        </div>
      ))}
    </div>
  );
};

export default BookingStats;
