// wallet/components/TopUpModal.jsx
import React from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";

export default function TopUpModal({ showTopUp, setShowTopUp, amount, setAmount, method, setMethod, topUpMutation }) {
  if (!showTopUp) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100"><h3 className="text-xl font-bold text-gray-900">Add Money to Wallet</h3></div>
        <div className="p-6 bg-gray-50 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Amount (Rs.)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rs.</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000" min="1" className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl font-bold focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all" />
            </div>
          </div>
          <div className="flex gap-2">
            {[1000, 2000, 5000, 10000].map((a) => (
              <button key={a} onClick={() => setAmount(String(a))} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${amount === String(a) ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"}`}>
                {a >= 1000 ? `${a / 1000}K` : a}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Payment Source</label>
            <div className="flex gap-2">
              {["jazzcash", "easypaisa", "test"].map((m) => (
                <button key={m} onClick={() => setMethod(m)} className={`flex-1 py-3 rounded-xl text-xs font-bold border capitalize transition-all ${method === m ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 bg-white"}`}>
                  {m === "test" ? "Test Flow" : m === "jazzcash" ? "JazzCash" : "Easypaisa"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 bg-white border-t border-gray-100">
          <button onClick={() => setShowTopUp(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={() => topUpMutation.mutate({ amount: Number(amount), method })} disabled={topUpMutation.isPending} className="flex-[2] py-3.5 bg-yellow-500 text-gray-900 rounded-xl font-bold shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {topUpMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaPlus />} Add Rs. {Number(amount || 0).toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}

