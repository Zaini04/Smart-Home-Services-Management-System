import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaSpinner, FaCheckCircle, FaExclamationTriangle, FaStar } from "react-icons/fa";
import {
  getPlatformDashboard, getPlatformWallet, adminWithdraw,
  getTopProviders,
} from "../../api/adminEndPoints";

// Components
import WalletHero from "../../components/admin/earnings/WalletHero";
import EarningsSummary from "../../components/admin/earnings/EarningsSummary";
import IncomeBreakdown from "../../components/admin/earnings/IncomeBreakdown";
import BookingStats from "../../components/admin/earnings/BookingStats";
import WithdrawModal from "../../components/admin/earnings/WithdrawModal";

export default function PlatformEarnings() {
  const queryClient = useQueryClient();

  // Withdraw modal state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("jazzcash");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [alert, setAlert] = useState(null);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["platformEarningsDashboard"],
    queryFn: async () => {
      const [dashRes, walletRes, topRes] = await Promise.all([
        getPlatformDashboard(),
        getPlatformWallet(),
        getTopProviders({ limit: 5 }),
      ]);
      return {
        dash: dashRes.data.data,
        wallet: walletRes.data.data,
        topProviders: topRes.data.data || []
      };
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: (data) => adminWithdraw(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["platformEarningsDashboard"]);
      setShowWithdraw(false);
      setAlert({ type: "success", text: `Rs. ${Number(variables.amount).toLocaleString()} successfully withdrawn!` });
      setTimeout(() => setAlert(null), 5000);
    },
    onError: (err) => {
      setAlert({ type: "error", text: err.response?.data?.message || "Withdrawal failed. Check your balance." });
      setTimeout(() => setAlert(null), 5000);
    }
  });

  const handleWithdraw = () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    withdrawMutation.mutate({
      amount: Number(withdrawAmount),
      method: withdrawMethod,
      accountNumber: withdrawAccount,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading financial data...</p>
      </div>
    );
  }

  const dashData = data?.dash || {};
  const walletData = data?.wallet || {};
  const topProvidersList = data?.topProviders || [];

  const earnings = dashData?.earnings || {};
  const income = dashData?.incomeBreakdown || {};
  const bookings = dashData?.bookings || {};
  const w = dashData?.wallet || walletData || {};

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto animate-fadeIn">
      
      {/* Dynamic Alerts */}
      {alert && (
        <div className={`p-5 rounded-2xl flex items-center gap-4 shadow-xl border-2 animate-bounceIn ${
          alert.type === "success" 
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.type === "success" ? "bg-green-200" : "bg-red-200"}`}>
            {alert.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
          </div>
          <p className="font-bold">{alert.text}</p>
        </div>
      )}

      <WalletHero 
        balance={w.currentBalance || 0}
        totalEarned={w.totalEarnings || 0}
        totalWithdrawn={w.totalWithdrawn || 0}
        onWithdraw={() => { setShowWithdraw(true); setWithdrawAmount(""); }}
      />

      <EarningsSummary 
        today={earnings.today || 0}
        thisWeek={earnings.thisWeek || 0}
        thisMonth={earnings.thisMonth || 0}
      />

      <IncomeBreakdown 
        commissions={income.commissions}
        penalties={income.penalties}
      />

      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
          <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
          Platform Activity Overview
        </h3>
        <BookingStats 
          total={bookings.total || 0}
          completed={bookings.completed || 0}
          active={bookings.active || 0}
          cancelled={bookings.cancelled || 0}
        />
      </div>

      {/* Top Providers Mini List */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <FaStar className="text-yellow-500" />
            Leading Performance
          </h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last 30 Days</span>
        </div>
        <div className="divide-y divide-gray-50">
          {topProvidersList.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 font-bold italic">No performance rankings available yet.</p>
            </div>
          ) : (
            topProvidersList.map((tp, i) => (
              <div key={i} className="flex items-center gap-6 p-6 hover:bg-blue-50/30 transition-all group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm
                  ${i === 0 ? 'bg-yellow-400 text-yellow-900 shadow-yellow-100' : 'bg-gray-100 text-gray-400'}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-lg">
                    {tp.provider?.userId?.full_name || "Service Provider"}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold text-gray-400">{tp.completedJobs} Jobs</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-xs font-bold text-yellow-600 flex items-center gap-1">
                      <FaStar className="w-3 h-3" /> {tp.provider?.rating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-600 text-xl tracking-tighter">Rs. {tp.totalEarning?.toLocaleString()}</p>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5">Comm: Rs. {tp.totalCommission?.toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showWithdraw && (
        <WithdrawModal 
          onClose={() => setShowWithdraw(false)}
          onWithdraw={handleWithdraw}
          balance={w.currentBalance || 0}
          amount={withdrawAmount}
          setAmount={setWithdrawAmount}
          method={withdrawMethod}
          setMethod={setWithdrawMethod}
          account={withdrawAccount}
          setAccount={setWithdrawAccount}
          loading={withdrawMutation.isPending}
        />
      )}

      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-bounceIn { animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounceIn { 
          from { opacity: 0; transform: scale(0.8); } 
          50% { transform: scale(1.05); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}