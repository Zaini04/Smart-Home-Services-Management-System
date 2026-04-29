import React from "react";

const KycInfoCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-bold text-gray-900 truncate text-lg leading-none">{value || "N/A"}</p>
    </div>
  </div>
);

export default KycInfoCard;
