// jobDetails/panels/VerifyOTPPanel.jsx
import React, { useState } from "react";
import { FaKey, FaCheckCircle, FaSpinner } from "react-icons/fa";

function VerifyOTPPanel({ onVerify, loading }) {
  const [otp, setOtp] = useState("");

  return (
    <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaKey className="text-teal-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-teal-800">Verify Start OTP</h3>
          <p className="text-teal-700 text-sm mt-0.5">Ask the resident for their Start OTP and enter it below.</p>
        </div>
      </div>
      <div className="flex gap-2 justify-center mb-4">
        {[0, 1, 2, 3].map((i) => (
          <input
            key={i}
            id={`sotp-${i}`}
            type="text"
            maxLength={1}
            value={otp[i] || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/, "");
              const arr = otp.split("");
              arr[i] = val;
              setOtp(arr.join("").slice(0, 4));
              if (val && i < 3) document.getElementById(`sotp-${i + 1}`)?.focus();
            }}
            className="w-14 h-16 text-center text-2xl font-bold border-2 border-teal-200 rounded-xl focus:border-teal-500 outline-none bg-white"
          />
        ))}
      </div>
      <button
        onClick={() => onVerify(otp)}
        disabled={loading || otp.length < 4}
        className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Verify OTP & Begin
      </button>
    </div>
  );
}

export default VerifyOTPPanel;

