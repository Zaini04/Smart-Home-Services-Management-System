import React from "react";
import { FaCheckCircle, FaExclamationTriangle, FaArrowDown, FaUndo } from "react-icons/fa";

const typeConfig = {
  commission_received: { color: "text-green-600", bg: "bg-green-50", label: "Commission", icon: FaCheckCircle },
  penalty_received:    { color: "text-red-600",   bg: "bg-red-50",   label: "Penalty",    icon: FaExclamationTriangle },
  admin_withdrawal:    { color: "text-blue-600",  bg: "bg-blue-50",  label: "Withdrawal", icon: FaArrowDown },
  refund:              { color: "text-amber-600", bg: "bg-amber-50", label: "Refund",     icon: FaUndo },
};

const TransactionItem = ({ tx }) => {
  const cfg = typeConfig[tx.type] || typeConfig.commission_received;
  const Icon = cfg.icon;

  return (
    <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-gray-50 transition-all group">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5">
          <p className="font-black text-gray-900 text-[11px] sm:text-sm uppercase tracking-tight">{cfg.label}</p>
          {tx.booking?.bookingId && (
            <span className="text-[9px] sm:text-[10px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              #{tx.booking.bookingId}
            </span>
          )}
        </div>
        <p className="text-[10px] sm:text-xs text-gray-500 truncate font-medium">{tx.description}</p>
        {tx.provider?.userId?.full_name && (
          <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1 font-bold">
            Provider: <span className="text-gray-600">{tx.provider.userId.full_name}</span>
          </p>
        )}
      </div>
      <div className="text-right flex-shrink-0 flex flex-col items-end">
        <p className={`font-black text-sm sm:text-lg tracking-tighter ${
          tx.type === "admin_withdrawal" ? "text-red-600" : "text-green-600"
        }`}>
          {tx.type === "admin_withdrawal" ? "-" : "+"}Rs. {tx.amount?.toLocaleString()}
        </p>
        <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
          {new Date(tx.createdAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

export default TransactionItem;
