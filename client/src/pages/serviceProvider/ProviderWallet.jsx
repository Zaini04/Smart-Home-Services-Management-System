import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaWallet, FaPlus, FaArrowDown, FaSpinner, FaCheckCircle,
  FaTimesCircle, FaLock, FaUnlock, FaExchangeAlt,
  FaExclamationTriangle, FaArrowUp, FaHistory, FaInfoCircle,
} from "react-icons/fa";
import {
  getProviderWallet, topUpWallet, withdrawFromWallet, getWalletTransactions,
} from "../../api/serviceProviderEndPoints";
import { COMMISSION_TIERS, MIN_WALLET_BALANCE } from "../../utils/commissionCalc";

const txTypeConfig = {
  credit:  { color: "text-green-600", bg: "bg-green-50 border-green-100", icon: FaArrowDown, label: "Credit" },
  debit:   { color: "text-red-600",   bg: "bg-red-50 border-red-100",   icon: FaArrowUp,   label: "Debit" },
  lock:    { color: "text-amber-600", bg: "bg-amber-50 border-amber-100", icon: FaLock,      label: "Locked" },
  unlock:  { color: "text-blue-600",  bg: "bg-blue-50 border-blue-100",  icon: FaUnlock,    label: "Unlocked" },
};

export default function ProviderWallet() {
  const queryClient = useQueryClient();

  const [txFilter, setTxFilter] = useState("");
  const [txPage, setTxPage] = useState(1);
  const [alert, setAlert] = useState(null);

  // Modals state
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("jazzcash");
  const [accountNumber, setAccountNumber] = useState("");

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 4000);
  };

  // Queries
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["providerWallet"],
    queryFn: async () => {
      const res = await getProviderWallet();
      return res.data.data;
    },
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["walletTransactions", txFilter, txPage],
    queryFn: async () => {
      const params = { page: txPage, limit: 15 };
      if (txFilter) params.type = txFilter;
      const res = await getWalletTransactions(params);
      return res.data.data;
    },
  });

  // Mutations
  const topUpMutation = useMutation({
    mutationFn: (data) => topUpWallet(data),
    onSuccess: (res) => {
      queryClient.setQueryData(["providerWallet"], res.data.data);
      queryClient.invalidateQueries(["walletTransactions"]);
      setShowTopUp(false);
      setAmount("");
      showAlert("success", `Funds added successfully!`);
    },
    onError: (err) => {
      showAlert("error", err.response?.data?.message || "Top-up failed");
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (data) => withdrawFromWallet(data),
    onSuccess: (res) => {
      queryClient.setQueryData(["providerWallet"], res.data.data);
      queryClient.invalidateQueries(["walletTransactions"]);
      setShowWithdraw(false);
      setAmount("");
      setAccountNumber("");
      showAlert("success", `Withdrawal successful!`);
    },
    onError: (err) => {
      showAlert("error", err.response?.data?.message || "Withdrawal failed");
    },
  });

  if (walletLoading) {
    return (
      <div className="flex justify-center py-20">
        <FaSpinner className="w-10 h-10 text-yellow-500 animate-spin" />
      </div>
    );
  }

  const wallet = walletData || {};
  const transactions = txData?.transactions || [];
  const txPagination = txData?.pagination || {};

  const balance = wallet.balance || 0;
  const locked = wallet.lockedAmount || 0;
  const available = wallet.availableBalance ?? (balance - locked);
  const belowMin = balance < MIN_WALLET_BALANCE;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2 px-4 sm:px-6 lg:px-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">My Wallet</h1>
          <p className="text-gray-500 text-sm md:text-base">Manage your balance and transactions</p>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`p-5 rounded-2xl flex items-center gap-3 font-bold shadow-sm ${
          alert.type === "success" ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {alert.type === "success" ? <FaCheckCircle className="w-5 h-5"/> : <FaTimesCircle className="w-5 h-5"/>}
          <p className="text-sm">{alert.text}</p>
        </div>
      )}

      {/* Low Balance Warning */}
      {belowMin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FaExclamationTriangle className="text-amber-600 w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-amber-900 mb-1 text-lg">Low Wallet Balance</p>
            <p className="text-amber-700 text-sm font-medium">
              We require a minimum safety deposit balance of Rs. {MIN_WALLET_BALANCE.toLocaleString()} to send offers.
              Please add funds to your wallet to continue securing jobs.
            </p>
          </div>
        </div>
      )}

      {/* ── BALANCE CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gray-900 rounded-3xl p-7 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full blur-[60px] opacity-20 pointer-events-none -mr-10 -mt-10"></div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <FaWallet className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-gray-300 text-sm font-bold uppercase tracking-wider">Total Balance</span>
          </div>
          <p className="text-3xl font-black relative z-10 tracking-tight">Rs. {balance.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-transform">
              <FaCheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Available</span>
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tight">Rs. {available.toLocaleString()}</p>
          <p className="text-xs font-semibold text-gray-400 mt-2">Free to withdraw</p>
        </div>

        <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-transform">
              <FaLock className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Locked</span>
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tight">Rs. {locked.toLocaleString()}</p>
          <p className="text-xs font-semibold text-gray-400 mt-2">Reserved as active jobs deposit</p>
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => { setShowTopUp(true); setAmount(""); }}
          className="flex-1 py-4 bg-yellow-500 text-gray-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all text-lg"
        >
          <FaPlus /> Add Money
        </button>
        <button
          onClick={() => { setShowWithdraw(true); setAmount(""); setAccountNumber(""); }}
          className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-800 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all text-lg shadow-sm"
        >
          <FaArrowDown /> Withdraw Funds
        </button>
      </div>

      {/* ── TRANSACTION HISTORY ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <FaHistory className="w-5 h-5 text-gray-500" />
            </div>
            Transaction History
          </h3>
          
          <div className="inline-flex p-1.5 bg-gray-100 rounded-xl overflow-x-auto w-full md:w-auto">
            {[
              { key: "", label: "All" },
              { key: "credit", label: "Credit" },
              { key: "debit", label: "Debit" },
              { key: "lock", label: "Locked" },
              { key: "unlock", label: "Unlocked" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => { setTxFilter(f.key); setTxPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                  txFilter === f.key ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {txLoading ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="w-8 h-8 text-yellow-500 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <FaExchangeAlt className="w-8 h-8 text-gray-300" />
            </div>
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
                  <div className={`w-12 h-12 rounded-2xl border ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{cfg.label}</p>
                    <p className="text-sm font-medium text-gray-500 truncate mt-0.5">{tx.reason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-black text-lg ${
                      tx.type === "credit" || tx.type === "unlock" ? "text-green-600" : "text-gray-900"
                    }`}>
                      {tx.type === "credit" || tx.type === "unlock" ? "+" : "-"}Rs. {tx.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-gray-400 mt-1">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {txPagination.pages > 1 && (
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              disabled={txPage <= 1}
              onClick={() => setTxPage(txPage - 1)}
              className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-gray-500">
              Page {txPage} of {txPagination.pages}
            </span>
            <button
              disabled={txPage >= txPagination.pages}
              onClick={() => setTxPage(txPage + 1)}
              className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Optional Commission Hint */}
      <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200 flex items-start gap-4">
        <FaInfoCircle className="text-yellow-600 w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-yellow-800">
          We use a Tiered Commission system designed to reward high-value jobs. Remember, the first 5 jobs on your brand new account are charged at 50% off standard commission rates!
        </p>
      </div>

      {/* ── MODALS ── */}
      
      {/* Top-Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Add Money to Wallet</h3>
            </div>
            <div className="p-6 bg-gray-50 space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount (Rs.)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rs.</span>
                  <input
                    type="number" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="5000" min="1"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl font-bold focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2">
                {[1000, 2000, 5000, 10000].map((a) => (
                  <button key={a} onClick={() => setAmount(String(a))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      amount === String(a) ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
                    }`}
                  >
                    {a >= 1000 ? `${a / 1000}K` : a}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Payment Source</label>
                <div className="flex gap-2">
                  {["jazzcash", "easypaisa", "test"].map((m) => (
                    <button key={m} onClick={() => setMethod(m)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold border capitalize transition-all ${
                        method === m ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 bg-white"
                      }`}
                    >
                      {m === "test" ? "Test Flow" : m === "jazzcash" ? "JazzCash" : "Easypaisa"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-white border-t border-gray-100">
              <button 
                onClick={() => setShowTopUp(false)}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => topUpMutation.mutate({ amount: Number(amount), method })} 
                disabled={topUpMutation.isPending}
                className="flex-[2] py-3.5 bg-yellow-500 text-gray-900 rounded-xl font-bold shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {topUpMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                Add Rs. {Number(amount || 0).toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
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
                  <input
                    type="number" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Min Rs. 500" min="1" max={available}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl font-bold focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Withdraw To</label>
                <div className="flex gap-2">
                  {["jazzcash", "easypaisa", "bank"].map((m) => (
                    <button key={m} onClick={() => setMethod(m)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold border capitalize transition-all ${
                        method === m ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 bg-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Account Number / IBAN</label>
                <input
                  type="text" value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="03XX-XXXXXXX"
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl font-bold focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-white border-t border-gray-100">
              <button 
                onClick={() => setShowWithdraw(false)}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => withdrawMutation.mutate({ amount: Number(amount), method, accountNumber })} 
                disabled={withdrawMutation.isPending}
                className="flex-[2] py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {withdrawMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaArrowDown />}
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}