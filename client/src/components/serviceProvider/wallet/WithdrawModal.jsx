// wallet/components/WithdrawModal.jsx
import React from "react";
import { FaArrowDown, FaSpinner } from "react-icons/fa";

export default function WithdrawModal({ showWithdraw, setShowWithdraw, amount, setAmount, method, setMethod, accountNumber, setAccountNumber, available, withdrawMutation }) {
  if (!showWithdraw) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Withdraw Funds</h3>
          <p className="text-gray-500 text-sm font-medium">Available balance: <span className="font-bold text-green-600">Rs. {available.toLocaleString()}</span></p>
        </div>
        <div className="p-6 bg-gray-50 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Amount to Withdraw (Rs.)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rs.</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Min Rs. 500" min="1" max={available} className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl font-bold focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Withdraw To</label>
            <div className="flex gap-2">
              {["jazzcash", "easypaisa", "bank"].map((m) => (
                <button key={m} onClick={() => setMethod(m)} className={`flex-1 py-3 rounded-xl text-xs font-bold border capitalize transition-all ${method === m ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 bg-white"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Account Number / IBAN</label>
            <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="03XX-XXXXXXX" className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl font-bold focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all" />
          </div>
        </div>
        <div className="flex gap-3 p-6 bg-white border-t border-gray-100">
          <button onClick={() => setShowWithdraw(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={() => withdrawMutation.mutate({ amount: Number(amount), method, accountNumber })} disabled={withdrawMutation.isPending} className="flex-[2] py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {withdrawMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaArrowDown />} Confirm Transfer
          </button>
        </div>
      </div>
    </div>
  );
}

