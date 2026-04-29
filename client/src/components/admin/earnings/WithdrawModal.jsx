import React from "react";
import { FaSpinner, FaTimes } from "react-icons/fa";

const WithdrawModal = ({ 
  onClose, 
  onWithdraw, 
  balance, 
  amount, setAmount, 
  method, setMethod, 
  account, setAccount, 
  loading 
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl p-8 relative animate-slideUp">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-black text-gray-900 mb-2">Withdraw Funds</h3>
        <p className="text-gray-500 text-sm font-medium mb-8">
          Available: <span className="text-emerald-600 font-bold">Rs. {balance.toLocaleString()}</span>
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Amount (PKR)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00" 
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold text-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Withdrawal Method</label>
            <div className="grid grid-cols-3 gap-2">
              {["jazzcash", "easypaisa", "bank"].map((m) => (
                <button 
                  key={m} 
                  onClick={() => setMethod(m)}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                    method === m 
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-inner" 
                      : "border-gray-100 text-gray-400 hover:border-gray-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Account Details</label>
            <input 
              type="text" 
              value={account} 
              onChange={(e) => setAccount(e.target.value)}
              placeholder="e.g. 03001234567" 
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button 
            onClick={onClose}
            className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-black text-gray-400 text-sm hover:bg-gray-50 transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={onWithdraw} 
            disabled={loading || !amount || Number(amount) <= 0}
            className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Confirm"}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default WithdrawModal;
