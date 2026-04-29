import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaArrowLeft, FaSpinner, FaExchangeAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getPlatformTransactions } from "../../api/adminEndPoints";

// Components
import TransactionItem from "../../components/admin/transactions/TransactionItem";

export default function PlatformTransactions() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading: loading } = useQuery({
    queryKey: ["platformTransactions", page, filter, startDate, endDate],
    queryFn: async () => {
      const params = { page, limit: 20 };
      if (filter) params.type = filter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await getPlatformTransactions(params);
      return {
        transactions: res.data?.data?.transactions || [],
        pagination: res.data?.data?.pagination || {}
      };
    }
  });

  const transactions = data?.transactions || [];
  const pagination = data?.pagination || {};

  const filters = [
    { key: "", label: "All Records" },
    { key: "commission_received", label: "Commissions" },
    { key: "penalty_received", label: "Penalties" },
    { key: "admin_withdrawal", label: "Withdrawals" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 max-w-5xl mx-auto animate-fadeIn px-2 sm:px-0">
      <div className="flex items-center gap-4 sm:gap-6">
        <button 
          onClick={() => navigate("/admin/platform-earnings")}
          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <FaArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">Platform Ledger</h1>
          <p className="text-[10px] sm:text-sm font-medium text-gray-500 mt-0.5 sm:mt-1">Detailed history of all financial activities.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100 flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch lg:items-center justify-between">
        <div className="flex p-1 bg-gray-100 rounded-xl sm:rounded-2xl overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button 
              key={f.key} 
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap flex-1 lg:flex-none ${
                filter === f.key 
                  ? "bg-white text-blue-600 shadow-md scale-100" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 sm:gap-4 items-center">
          <div className="relative group flex-1 sm:flex-none">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border-2 border-gray-100 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none" 
            />
          </div>
          <span className="text-gray-300 font-black text-xs sm:text-base">→</span>
          <div className="relative group flex-1 sm:flex-none">
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border-2 border-gray-100 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none" 
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">Syncing Ledger...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExchangeAlt className="text-gray-300 text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Transactions Found</h3>
            <p className="text-gray-500 mt-1 max-w-xs mx-auto">Try adjusting your filters or date range to see more records.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <TransactionItem key={tx._id} tx={tx} />
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <button 
              disabled={page <= 1} 
              onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-500 bg-white border-2 border-gray-100 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-all"
            >
              Previous
            </button>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Page {page} of {pagination.pages}
            </span>
            <button 
              disabled={page >= pagination.pages} 
              onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-blue-600 bg-white border-2 border-blue-50 rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-all"
            >
              Next Page
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}