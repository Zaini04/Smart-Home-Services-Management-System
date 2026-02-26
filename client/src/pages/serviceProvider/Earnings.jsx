import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaWallet,
  FaMoneyBillWave,
  FaCheckCircle,
  FaShieldAlt,
  FaArrowRight,
  FaSpinner,
  FaBriefcase,
} from "react-icons/fa";
import { getProviderDashboard } from "../../api/serviceProviderEndPoints";

export default function Earnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getProviderDashboard();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const provider = data?.provider || {};
  const stats = data?.stats || {};

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Earnings</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Track your income and wallet balance
        </p>
      </div>

      {/* Wallet Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-green-100 text-sm">Total Wallet Balance</p>
            {loading ? (
              <div className="h-9 w-44 bg-white/20 rounded-lg animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold mt-1">
                Rs. {(provider.walletBalance || 0).toLocaleString()}
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <FaWallet className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 bg-white text-green-600 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors">
            Withdraw Funds
          </button>
          <button className="flex-1 py-2.5 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors border border-white/20">
            Transaction History
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          {
            icon: FaMoneyBillWave,
            label: "Today's Earnings",
            value: `Rs. ${(stats.todayEarnings || 0).toLocaleString()}`,
            bg: "bg-blue-50",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
          },
          {
            icon: FaCheckCircle,
            label: "Jobs Completed",
            value: stats.completedJobs || 0,
            bg: "bg-green-50",
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
          },
          {
            icon: FaBriefcase,
            label: "Active Jobs",
            value: stats.activeJobs || 0,
            bg: "bg-purple-50",
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`${card.bg} rounded-2xl p-5 border border-gray-100`}
          >
            <div
              className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mb-3`}
            >
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            {loading ? (
              <div className="h-6 w-20 bg-white rounded animate-pulse mb-1" />
            ) : (
              <p className="text-xl font-bold text-gray-800">{card.value}</p>
            )}
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Commission Structure */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaShieldAlt className="text-blue-600" />
          Commission Structure
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "Platform Commission",
              value: "15% of labor cost",
              note: "Deducted from labor charges only",
              valueColor: "text-red-600",
            },
            {
              label: "Material Charges",
              value: "0% commission",
              note: "Full material cost goes to you",
              valueColor: "text-green-600",
            },
            {
              label: "Payment Release",
              value: "Instant to wallet",
              note: "After resident confirms with OTP",
              valueColor: "text-blue-600",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {item.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>
              </div>
              <span className={`font-bold text-sm ${item.valueColor}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Example */}
      <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5">
        <h4 className="font-semibold text-blue-800 mb-3">
          💡 Example Calculation
        </h4>
        <div className="space-y-2 text-sm">
          {[
            { label: "Your Labor Charge", value: "Rs. 2,000", color: "" },
            { label: "Material Cost", value: "Rs. 500", color: "" },
            { label: "Resident Pays Total", value: "Rs. 2,500", color: "font-semibold" },
            { label: "Platform Fee (15% of Rs. 2,000)", value: "− Rs. 300", color: "text-red-600" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between">
              <span className="text-gray-600">{row.label}</span>
              <span className={`font-medium ${row.color}`}>{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-green-700 border-t border-blue-200 pt-2 mt-1">
            <span>Your Earning</span>
            <span>Rs. 2,200</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <FaBriefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 text-sm mb-4">
          Complete more jobs to grow your earnings
        </p>
        <Link
          to="/provider/available-jobs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          Browse Available Jobs
          <FaArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}