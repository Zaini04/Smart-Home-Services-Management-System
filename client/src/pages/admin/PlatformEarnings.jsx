import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  FaWallet, FaMoneyBillWave, FaChartLine, FaArrowUp,
  FaArrowDown, FaSpinner, FaArrowRight, FaStar,
  FaCheckCircle, FaExclamationTriangle, FaUsers,
  FaClipboardList, FaCalendarAlt,
} from "react-icons/fa";
import {
  getPlatformDashboard, getPlatformWallet, adminWithdraw,
  getTopProviders,
} from "../../api/adminEndPoints";

export default function PlatformEarnings() {
  const queryClient = useQueryClient();

  // Withdraw modal
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
      setAlert({ type: "success", text: `Rs. ${Number(variables.amount).toLocaleString()} withdrawn!` });
      setTimeout(() => setAlert(null), 4000);
    },
    onError: (err) => {
      setAlert({ type: "error", text: err.response?.data?.message || "Withdrawal failed" });
      setTimeout(() => setAlert(null), 4000);
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
      <div className="flex items-center justify-center h-[60vh]">
        <FaSpinner className="w-10 h-10 text-blue-600 animate-spin" />
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
    <div className="space-y-8">

      {/* Alert */}
      {alert && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          alert.type === "success" ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {alert.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <p className="text-sm font-medium">{alert.text}</p>
        </div>
      )}

      {/* Platform Wallet Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaWallet className="w-8 h-8" />
              <h2 className="text-xl font-bold">Platform Wallet</h2>
            </div>
            <p className="text-4xl font-bold mb-1">
              Rs. {(w.currentBalance || 0).toLocaleString()}
            </p>
            <p className="text-emerald-100 text-sm">Available to withdraw</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/20 rounded-2xl p-4 min-w-[140px]">
              <p className="text-emerald-100 text-xs mb-1">Total Earned</p>
              <p className="text-2xl font-bold">Rs. {(w.totalEarnings || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 min-w-[140px]">
              <p className="text-emerald-100 text-xs mb-1">Total Withdrawn</p>
              <p className="text-2xl font-bold">Rs. {(w.totalWithdrawn || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={() => { setShowWithdraw(true); setWithdrawAmount(""); }}
            className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 shadow-md"
          >
            Withdraw Funds
          </button>
          <Link to="/admin/platform-transactions"
            className="px-6 py-3 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 border border-white/30"
          >
            View Transactions
          </Link>
        </div>
      </div>

      {/* Earnings Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today", value: earnings.today || 0, icon: FaCalendarAlt, bg: "bg-blue-50", color: "text-blue-600", iconBg: "bg-blue-100" },
          { label: "This Week", value: earnings.thisWeek || 0, icon: FaChartLine, bg: "bg-green-50", color: "text-green-600", iconBg: "bg-green-100" },
          { label: "This Month", value: earnings.thisMonth || 0, icon: FaMoneyBillWave, bg: "bg-purple-50", color: "text-purple-600", iconBg: "bg-purple-100" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-6 border border-gray-100`}>
            <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-800">Rs. {s.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Income Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-green-600" /> Commission Income
          </h3>
          <p className="text-3xl font-bold text-green-600">
            Rs. {(income.commissions?.total || 0).toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            From {income.commissions?.count || 0} completed jobs
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" /> Penalty Income
          </h3>
          <p className="text-3xl font-bold text-red-600">
            Rs. {(income.penalties?.total || 0).toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            From {income.penalties?.count || 0} cancellations
          </p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: bookings.total || 0, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed", value: bookings.completed || 0, color: "text-green-600", bg: "bg-green-50" },
          { label: "Active", value: bookings.active || 0, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Cancelled", value: bookings.cancelled || 0, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Top Providers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FaStar className="text-yellow-500" /> Top Providers
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {topProvidersList.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No data yet</p>
          ) : (
            topProvidersList.map((tp, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">
                    {tp.provider?.userId?.full_name || "Provider"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tp.completedJobs} jobs • Rating: {tp.provider?.rating?.toFixed(1) || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 text-sm">Rs. {tp.totalEarning?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Commission: Rs. {tp.totalCommission?.toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Withdraw Funds</h3>
            <p className="text-gray-500 text-sm mb-5">
              Available: <span className="font-bold text-green-600">Rs. {(w.currentBalance || 0).toLocaleString()}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (Rs.)</label>
                <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 10000" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Method</label>
                <div className="flex gap-2">
                  {["jazzcash", "easypaisa", "bank"].map((m) => (
                    <button key={m} onClick={() => setWithdrawMethod(m)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 capitalize ${
                        withdrawMethod === m ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"
                      }`}
                    >{m}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
                <input type="text" value={withdrawAccount} onChange={(e) => setWithdrawAccount(e.target.value)}
                  placeholder="03XX-XXXXXXX" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowWithdraw(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
              >Cancel</button>
              <button onClick={handleWithdraw} disabled={withdrawMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {withdrawMutation.isPending ? <FaSpinner className="animate-spin" /> : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}