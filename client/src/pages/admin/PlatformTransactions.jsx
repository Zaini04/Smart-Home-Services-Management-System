import React, { useEffect, useState } from "react";
import {
  FaArrowLeft, FaSpinner, FaExchangeAlt, FaFilter,
  FaCheckCircle, FaExclamationTriangle, FaArrowDown,
  FaMoneyBillWave, FaUndo,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getPlatformTransactions } from "../../api/adminEndPoints";

const typeConfig = {
  commission_received: { color: "text-green-600", bg: "bg-green-50", label: "Commission", icon: FaCheckCircle },
  penalty_received:    { color: "text-red-600",   bg: "bg-red-50",   label: "Penalty",    icon: FaExclamationTriangle },
  admin_withdrawal:    { color: "text-blue-600",  bg: "bg-blue-50",  label: "Withdrawal", icon: FaArrowDown },
  refund:              { color: "text-amber-600", bg: "bg-amber-50", label: "Refund",     icon: FaUndo },
};

export default function PlatformTransactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => { fetchTransactions(); }, [page, filter, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filter) params.type = filter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await getPlatformTransactions(params);
      setTransactions(res.data.data.transactions || []);
      setPagination(res.data.data.pagination || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filters = [
    { key: "", label: "All" },
    { key: "commission_received", label: "Commissions" },
    { key: "penalty_received", label: "Penalties" },
    { key: "admin_withdrawal", label: "Withdrawals" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/platform-earnings")}
          className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
        >
          <FaArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Platform Transactions</h2>
          <p className="text-gray-500 text-sm">All platform income and withdrawals</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-end">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {filters.map((f) => (
            <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.key ? "bg-white shadow text-blue-600" : "text-gray-500"
              }`}
            >{f.label}</button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <span className="text-gray-400">to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <FaExchangeAlt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => {
              const cfg = typeConfig[tx.type] || typeConfig.commission_received;
              const Icon = cfg.icon;
              return (
                <div key={tx._id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors">
                  <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{cfg.label}</p>
                    <p className="text-xs text-gray-500 truncate">{tx.description}</p>
                    <div className="flex gap-3 mt-1">
                      {tx.booking?.bookingId && (
                        <span className="text-xs text-blue-500">#{tx.booking.bookingId}</span>
                      )}
                      {tx.provider?.userId?.full_name && (
                        <span className="text-xs text-gray-400">
                          Provider: {tx.provider.userId.full_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold ${
                      tx.type === "admin_withdrawal" ? "text-red-600" : "text-green-600"
                    }`}>
                      {tx.type === "admin_withdrawal" ? "-" : "+"}Rs. {tx.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
}