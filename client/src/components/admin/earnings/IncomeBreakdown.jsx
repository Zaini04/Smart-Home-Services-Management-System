import React from "react";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const IncomeBreakdown = ({ commissions, penalties }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl border border-gray-100 group">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="font-black text-gray-900 text-lg sm:text-xl flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl">
              <FaCheckCircle className="text-green-600" />
            </div>
            Commissions
          </h3>
          <span className="hidden sm:inline-block px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg border border-green-100 tracking-wider">
            Completed Jobs
          </span>
        </div>
        <p className="text-2xl sm:text-4xl font-black text-green-600 tracking-tighter">
          Rs. {(commissions?.total || 0).toLocaleString()}
        </p>
        <p className="text-gray-400 font-bold text-[10px] sm:text-sm mt-2 uppercase tracking-wide">
          From {commissions?.count || 0} successfully delivered services
        </p>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl border border-gray-100 group">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="font-black text-gray-900 text-lg sm:text-xl flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg sm:rounded-xl">
              <FaExclamationTriangle className="text-red-600" />
            </div>
            Cancellation Fees
          </h3>
          <span className="hidden sm:inline-block px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg border border-red-100 tracking-wider">
            Penalties
          </span>
        </div>
        <p className="text-2xl sm:text-4xl font-black text-red-600 tracking-tighter">
          Rs. {(penalties?.total || 0).toLocaleString()}
        </p>
        <p className="text-gray-400 font-bold text-[10px] sm:text-sm mt-2 uppercase tracking-wide">
          From {penalties?.count || 0} policy violations / cancellations
        </p>
      </div>
    </div>
  );
};

export default IncomeBreakdown;
