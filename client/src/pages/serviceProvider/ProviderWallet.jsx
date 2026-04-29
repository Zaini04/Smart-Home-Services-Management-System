// wallet/ProviderWallet.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaWallet, FaPlus, FaArrowDown, FaSpinner, FaCheckCircle, FaTimesCircle, FaLock, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { getProviderWallet, topUpWallet, withdrawFromWallet, getWalletTransactions } from "../../api/serviceProviderEndPoints";
import { MIN_WALLET_BALANCE } from "../../utils/commissionCalc";
import TransactionHistory from "../../components/serviceProvider/wallet/TransactionHistory";
import TopUpModal from "../../components/serviceProvider/wallet/TopUpModal";
import WithdrawModal from "../../components/serviceProvider/wallet/WithdrawModal";

export default function ProviderWallet() {
  const queryClient = useQueryClient();
  const [txFilter, setTxFilter] = useState("");
  const [txPage, setTxPage] = useState(1);
  const [alert, setAlert] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("jazzcash");
  const [accountNumber, setAccountNumber] = useState("");

  const showAlert = (type, text) => { setAlert({ type, text }); setTimeout(() => setAlert(null), 4000); };

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["providerWallet"],
    queryFn: async () => { const res = await getProviderWallet(); return res.data.data; },
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

  const topUpMutation = useMutation({
    mutationFn: (data) => topUpWallet(data),
    onSuccess: (res) => {
      queryClient.setQueryData(["providerWallet"], res.data.data);
      queryClient.invalidateQueries(["walletTransactions"]);
      setShowTopUp(false);
      setAmount("");
      showAlert("success", `Funds added successfully!`);
    },
    onError: (err) => showAlert("error", err.response?.data?.message || "Top-up failed"),
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
    onError: (err) => showAlert("error", err.response?.data?.message || "Withdrawal failed"),
  });

  if (walletLoading) return <div className="flex justify-center py-20"><FaSpinner className="w-10 h-10 text-yellow-500 animate-spin" /></div>;

  const wallet = walletData || {};
  const transactions = txData?.transactions || [];
  const txPagination = txData?.pagination || {};
  const balance = wallet.balance || 0;
  const locked = wallet.lockedAmount || 0;
  const available = wallet.availableBalance ?? (balance - locked);
  const belowMin = balance < MIN_WALLET_BALANCE;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
        <div><h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">My Wallet</h1><p className="text-gray-500 text-sm md:text-base">Manage your balance and transactions</p></div>
      </div>

      {alert && (
        <div className={`p-5 rounded-2xl flex items-center gap-3 font-bold shadow-sm ${alert.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {alert.type === "success" ? <FaCheckCircle className="w-5 h-5"/> : <FaTimesCircle className="w-5 h-5"/>}<p className="text-sm">{alert.text}</p>
        </div>
      )}

      {belowMin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0"><FaExclamationTriangle className="text-amber-600 w-5 h-5" /></div>
          <div><p className="font-bold text-amber-900 mb-1 text-lg">Low Wallet Balance</p><p className="text-amber-700 text-sm font-medium">We require a minimum safety deposit balance of Rs. {MIN_WALLET_BALANCE.toLocaleString()} to send offers. Please add funds to your wallet to continue securing jobs.</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gray-900 rounded-3xl p-7 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full blur-[60px] opacity-20 pointer-events-none -mr-10 -mt-10"></div>
          <div className="flex items-center gap-3 mb-4 relative z-10"><div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><FaWallet className="w-5 h-5 text-yellow-500" /></div><span className="text-gray-300 text-sm font-bold uppercase tracking-wider">Total Balance</span></div>
          <p className="text-3xl font-black relative z-10 tracking-tight">Rs. {balance.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 relative z-10"><div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-transform"><FaCheckCircle className="w-5 h-5 text-green-500" /></div><span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Available</span></div>
          <p className="text-3xl font-black text-gray-900 tracking-tight">Rs. {available.toLocaleString()}</p><p className="text-xs font-semibold text-gray-400 mt-2">Free to withdraw</p>
        </div>
        <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 relative z-10"><div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-transform"><FaLock className="w-4 h-4 text-amber-500" /></div><span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Locked</span></div>
          <p className="text-3xl font-black text-gray-900 tracking-tight">Rs. {locked.toLocaleString()}</p><p className="text-xs font-semibold text-gray-400 mt-2">Reserved as active jobs deposit</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => { setShowTopUp(true); setAmount(""); }} className="flex-1 py-4 bg-yellow-500 text-gray-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all text-lg"><FaPlus /> Add Money</button>
        <button onClick={() => { setShowWithdraw(true); setAmount(""); setAccountNumber(""); }} className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-800 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all text-lg shadow-sm"><FaArrowDown /> Withdraw Funds</button>
      </div>

      <TransactionHistory txLoading={txLoading} transactions={transactions} txPagination={txPagination} txFilter={txFilter} setTxFilter={setTxFilter} txPage={txPage} setTxPage={setTxPage} />

      <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200 flex items-start gap-4">
        <FaInfoCircle className="text-yellow-600 w-5 h-5 flex-shrink-0 mt-0.5" /><p className="text-sm font-semibold text-yellow-800">We use a Tiered Commission system designed to reward high-value jobs. Remember, the first 5 jobs on your brand new account are charged at 50% off standard commission rates!</p>
      </div>

      <TopUpModal showTopUp={showTopUp} setShowTopUp={setShowTopUp} amount={amount} setAmount={setAmount} method={method} setMethod={setMethod} topUpMutation={topUpMutation} />
      <WithdrawModal showWithdraw={showWithdraw} setShowWithdraw={setShowWithdraw} amount={amount} setAmount={setAmount} method={method} setMethod={setMethod} accountNumber={accountNumber} setAccountNumber={setAccountNumber} available={available} withdrawMutation={withdrawMutation} />
    </div>
  );
}

