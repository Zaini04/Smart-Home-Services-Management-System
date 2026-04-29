import React from "react";
import { FaWallet } from "react-icons/fa";
import { Link } from "react-router-dom";

const WalletHero = ({ balance, totalEarned, totalWithdrawn, onWithdraw }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 sm:gap-10">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner">
              <FaWallet className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-emerald-50">Platform Wallet</h2>
              <p className="text-[10px] sm:text-sm font-bold text-emerald-200/80 uppercase tracking-widest">Available Balance</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2 sm:gap-3">
            <span className="text-3xl sm:text-5xl font-black tracking-tighter">Rs. {balance.toLocaleString()}</span>
            <span className="text-emerald-300 font-bold animate-pulse text-[10px] sm:text-sm uppercase tracking-widest">Live</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 flex-1 sm:flex-none min-w-[140px] sm:min-w-[180px] shadow-lg">
            <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2 opacity-70">Total Earnings</p>
            <p className="text-xl sm:text-3xl font-black">Rs. {totalEarned.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 flex-1 sm:flex-none min-w-[140px] sm:min-w-[180px] shadow-lg">
            <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2 opacity-70">Total Withdrawn</p>
            <p className="text-xl sm:text-3xl font-black">Rs. {totalWithdrawn.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-10">
        <button 
          onClick={onWithdraw}
          className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-emerald-700 font-black rounded-xl sm:rounded-2xl hover:bg-emerald-50 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base uppercase tracking-widest"
        >
          Withdraw Funds
        </button>
        <Link 
          to="/admin/platform-transactions"
          className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-emerald-500/30 text-white font-bold rounded-xl sm:rounded-2xl hover:bg-emerald-500/40 backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 text-sm sm:text-base uppercase tracking-widest"
        >
          Transaction History
        </Link>
      </div>
    </div>
  );
};

export default WalletHero;
