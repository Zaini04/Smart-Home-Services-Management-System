// pages/resident/bookingDetails/panels/ConfirmPaymentPanel.jsx
import React, { useState } from "react";
import { FaShieldAlt, FaCheckCircle, FaSpinner } from "react-icons/fa";

function ConfirmPaymentPanel({ booking, onConfirm, actionLoading }) {
  const [otp, setOtp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const total = booking.finalPrice?.totalAmount || 0;

  return (
    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaShieldAlt className="text-indigo-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-indigo-800">Confirm Completion</h3>
          <p className="text-indigo-700 text-sm mt-0.5">
            Work is done. Enter the complete OTP from the worker to confirm and pay.
          </p>
        </div>
      </div>

      {/* OTP Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Complete OTP (from worker)
        </label>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={otp[i] || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/, "");
                const arr = otp.split("");
                arr[i] = val;
                setOtp(arr.join("").slice(0, 4));
                if (val && i < 3)
                  document.getElementById(`otp-${i + 1}`)?.focus();
              }}
              id={`otp-${i}`}
              className="w-14 h-16 text-center text-2xl font-bold border-2 border-indigo-200 rounded-xl focus:border-indigo-500 outline-none bg-white"
            />
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <div className="flex gap-3">
          {[
            { key: "cash", label: "💵 Cash" },
            { key: "online", label: "💳 Online" },
          ].map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setPaymentMethod(m.key)}
              className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                paymentMethod === m.key
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="bg-white rounded-xl p-4 border border-indigo-200 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount to Pay</span>
          <span className="text-2xl font-bold text-indigo-600">
            Rs. {total.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Pay directly to the worker (
          {booking.paymentMethod === "online" ? "via their account" : "cash"})
        </p>
      </div>

      <button
        onClick={() => onConfirm(otp, paymentMethod)}
        disabled={actionLoading || otp.length < 4}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
        Confirm Payment &amp; Complete
      </button>
    </div>
  );
}

export default ConfirmPaymentPanel;

