import React, { useEffect, useState } from "react";
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
  credit:  { color: "text-green-600", bg: "bg-green-50", icon: FaArrowDown, label: "Credit" },
  debit:   { color: "text-red-600",   bg: "bg-red-50",   icon: FaArrowUp,   label: "Debit" },
  lock:    { color: "text-amber-600", bg: "bg-amber-50", icon: FaLock,      label: "Locked" },
  unlock:  { color: "text-blue-600",  bg: "bg-blue-50",  icon: FaUnlock,    label: "Unlocked" },
};

export default function ProviderWallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txPagination, setTxPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);

  // Modal state
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("jazzcash");
  const [accountNumber, setAccountNumber] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [txFilter, setTxFilter] = useState("");
  const [txPage, setTxPage] = useState(1);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchTransactions(); }, [txFilter, txPage]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getProviderWallet();
      setWallet(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
    fetchTransactions();
  };

  const fetchTransactions = async () => {
    try {
      setTxLoading(true);
      const params = { page: txPage, limit: 15 };
      if (txFilter) params.type = txFilter;
      const res = await getWalletTransactions(params);
      setTransactions(res.data.data.transactions || []);
      setTxPagination(res.data.data.pagination || {});
    } catch (err) { console.error(err); }
    finally { setTxLoading(false); }
  };

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleTopUp = async () => {
    if (!amount || Number(amount) <= 0) { showAlert("error", "Enter a valid amount"); return; }
    try {
      setActionLoading(true);
      const res = await topUpWallet({ amount: Number(amount), method });
      setWallet(res.data.data);
      setShowTopUp(false);
      setAmount("");
      showAlert("success", `Rs. ${Number(amount).toLocaleString()} added to wallet!`);
      fetchTransactions();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Top-up failed");
    } finally { setActionLoading(false); }
  };

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) { showAlert("error", "Enter a valid amount"); return; }
    try {
      setActionLoading(true);
      const res = await withdrawFromWallet({ amount: Number(amount), method, accountNumber });
      setWallet(res.data.data);
      setShowWithdraw(false);
      setAmount("");
      setAccountNumber("");
      showAlert("success", `Rs. ${Number(amount).toLocaleString()} withdrawal successful!`);
      fetchTransactions();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Withdrawal failed");
    } finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <FaSpinner className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  const balance = wallet?.balance || 0;
  const locked = wallet?.lockedAmount || 0;
  const available = wallet?.availableBalance || balance - locked;
  const belowMin = balance < MIN_WALLET_BALANCE;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Wallet</h2>
        <p className="text-gray-500 text-sm">Manage your balance, top-up, and withdraw</p>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          alert.type === "success" ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {alert.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          <p className="text-sm font-medium">{alert.text}</p>
        </div>
      )}

      {/* Low Balance Warning */}
      {belowMin && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <FaExclamationTriangle className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Low Wallet Balance</p>
            <p className="text-amber-700 text-sm">
              Minimum Rs. {MIN_WALLET_BALANCE.toLocaleString()} required to send offers.
              Please top up your wallet.
            </p>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaWallet className="w-5 h-5 text-blue-200" />
            <span className="text-blue-200 text-sm">Total Balance</span>
          </div>
          <p className="text-3xl font-bold">Rs. {balance.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FaLock className="w-4 h-4 text-amber-500" />
            <span className="text-gray-500 text-sm">Locked (Commission)</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">Rs. {locked.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Reserved for active jobs</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FaCheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-500 text-sm">Available</span>
          </div>
          <p className="text-2xl font-bold text-green-600">Rs. {available.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Can withdraw or use</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => { setShowTopUp(true); setAmount(""); }}
          className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
        >
          <FaPlus /> Add Money
        </button>
        <button
          onClick={() => { setShowWithdraw(true); setAmount(""); setAccountNumber(""); }}
          className="flex-1 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          <FaArrowDown /> Withdraw
        </button>
      </div>

      {/* Commission Tiers */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaInfoCircle className="text-blue-600" />
          Commission Tiers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COMMISSION_TIERS.map((tier) => (
            <div key={tier.range} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Labor Rs.</p>
              <p className="font-semibold text-gray-800 text-sm">{tier.range}</p>
              <p className="text-blue-600 font-bold text-lg mt-1">{tier.rate}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          ✨ First 5 completed jobs get 50% discount on commission!
        </p>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FaHistory className="text-gray-500" />
            Transaction History
          </h3>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  txFilter === f.key ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {txLoading ? (
          <div className="flex justify-center py-10">
            <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10">
            <FaExchangeAlt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => {
              const cfg = txTypeConfig[tx.type] || txTypeConfig.credit;
              const Icon = cfg.icon;
              return (
                <div key={tx._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{cfg.label}</p>
                    <p className="text-xs text-gray-500 truncate">{tx.reason}</p>
                    {tx.booking?.bookingId && (
                      <p className="text-xs text-blue-500">#{tx.booking.bookingId}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${
                      tx.type === "credit" || tx.type === "unlock" ? "text-green-600" : "text-red-600"
                    }`}>
                      {tx.type === "credit" || tx.type === "unlock" ? "+" : "-"}Rs. {tx.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {txPagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <button
              disabled={txPage <= 1}
              onClick={() => setTxPage(txPage - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {txPage} of {txPagination.pages}
            </span>
            <button
              disabled={txPage >= txPagination.pages}
              onClick={() => setTxPage(txPage + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Top-Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Add Money</h3>
            <p className="text-gray-500 text-sm mb-5">
              Testing mode — money added instantly
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (Rs.)</label>
                <input
                  type="number" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000" min="1"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none"
                />
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2">
                {[1000, 2000, 5000, 10000].map((a) => (
                  <button key={a} onClick={() => setAmount(String(a))}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      amount === String(a) ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {a >= 1000 ? `${a / 1000}K` : a}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Method</label>
                <div className="flex gap-2">
                  {["jazzcash", "easypaisa", "test"].map((m) => (
                    <button key={m} onClick={() => setMethod(m)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 capitalize transition-all ${
                        method === m ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {m === "test" ? "🧪 Test" : m === "jazzcash" ? "📱 JazzCash" : "📱 Easypaisa"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTopUp(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={handleTopUp} disabled={actionLoading}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {actionLoading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                Add Rs. {Number(amount || 0).toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Withdraw Funds</h3>
            <p className="text-gray-500 text-sm mb-1">
              Available: <span className="font-bold text-green-600">Rs. {available.toLocaleString()}</span>
            </p>
            <p className="text-xs text-gray-400 mb-5">Testing mode — instant withdrawal</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (Rs.)</label>
                <input
                  type="number" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 2000" min="1" max={available}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Withdraw To</label>
                <div className="flex gap-2">
                  {["jazzcash", "easypaisa", "bank"].map((m) => (
                    <button key={m} onClick={() => setMethod(m)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 capitalize transition-all ${
                        method === m ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
                <input
                  type="text" value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="03XX-XXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowWithdraw(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={handleWithdraw} disabled={actionLoading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {actionLoading ? <FaSpinner className="animate-spin" /> : <FaArrowDown />}
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}