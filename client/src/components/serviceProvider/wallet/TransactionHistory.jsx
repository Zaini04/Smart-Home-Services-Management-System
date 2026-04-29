// wallet/components/TransactionHistory.jsx
import React from "react";
import { FaHistory, FaExchangeAlt, FaArrowDown, FaArrowUp, FaLock, FaUnlock, FaSpinner } from "react-icons/fa";

export const txTypeConfig = {
  credit: { color: "text-green-600", bg: "bg-green-50 border-green-100", icon: FaArrowDown, label: "Credit" },
  debit: { color: "text-red-600", bg: "bg-red-50 border-red-100", icon: FaArrowUp, label: "Debit" },
  lock: { color: "text-amber-600", bg: "bg-amber-50 border-amber-100", icon: FaLock, label: "Locked" },
  unlock: { color: "text-blue-600", bg: "bg-blue-50 border-blue-100", icon: FaUnlock, label: "Unlocked" },
};

export default function TransactionHistory({ txLoading, transactions, txPagination, txFilter, setTxFilter, txPage, setTxPage }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <FaHistory className="w-5 h-5 text-gray-500" />
          </div>
          Transaction History
        </h3>
        <div className="inline-flex p-1.5 bg-gray-100 rounded-xl overflow-x-auto w-full md:w-auto">
          {[{ key: "", label: "All" }, { key: "credit", label: "Credit" }, { key: "debit", label: "Debit" }, { key: "lock", label: "Locked" }, { key: "unlock", label: "Unlocked" }].map((f) => (
            <button key={f.key} onClick={() => { setTxFilter(f.key); setTxPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${txFilter === f.key ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {txLoading ? (
        <div className="flex justify-center py-16"><FaSpinner className="w-8 h-8 text-yellow-500 animate-spin" /></div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100"><FaExchangeAlt className="w-8 h-8 text-gray-300" /></div>
          <h4 className="text-lg font-bold text-gray-900 mb-1">No Transactions</h4>
          <p className="text-gray-500 text-sm">Your past transactions will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {transactions.map((tx) => {
            const cfg = txTypeConfig[tx.type] || txTypeConfig.credit;
            const Icon = cfg.icon;
            return (
              <div key={tx._id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 rounded-2xl border ${cfg.bg} flex items-center justify-center flex-shrink-0`}><Icon className={`w-5 h-5 ${cfg.color}`} /></div>
                <div className="flex-1 min-w-0"><p className="font-bold text-gray-900">{cfg.label}</p><p className="text-sm font-medium text-gray-500 truncate mt-0.5">{tx.reason}</p></div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-black text-lg ${tx.type === "credit" || tx.type === "unlock" ? "text-green-600" : "text-gray-900"}`}>
                    {tx.type === "credit" || tx.type === "unlock" ? "+" : "-"}Rs. {tx.amount?.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold text-gray-400 mt-1">{new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {txPagination.pages > 1 && (
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button disabled={txPage <= 1} onClick={() => setTxPage(txPage - 1)} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm">Previous</button>
          <span className="text-sm font-bold text-gray-500">Page {txPage} of {txPagination.pages}</span>
          <button disabled={txPage >= txPagination.pages} onClick={() => setTxPage(txPage + 1)} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm">Next</button>
        </div>
      )}
    </div>
  );
}

