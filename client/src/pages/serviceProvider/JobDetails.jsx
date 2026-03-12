import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaArrowLeft, FaUser, FaPhone, FaMapMarkerAlt, FaClock,
  FaCheckCircle, FaTimesCircle, FaSpinner, FaTools,
  FaClipboardList, FaKey, FaMoneyBillWave, FaSearch,
  FaExclamationTriangle, FaStar, FaShieldAlt, FaReceipt,
  FaCalendarAlt, FaEdit, FaHistory, FaBan, FaWallet,
  FaInfoCircle,
} from "react-icons/fa";
import {
  getJobDetails, verifyStartOTP, completeInspection,
  sendFinalPrice, startWork, completeWork,
  requestInspection, respondToCounterFee, updatePriceDuringWork,
  updateSchedule, providerCancelJob, getProviderWallet,
} from "../../api/serviceProviderEndPoints";
import { calculateCommission, MIN_WALLET_BALANCE } from "../../utils/commissionCalc";

/* ─────────────────────────────────────────
   PROGRESS STEPS
───────────────────────────────────────── */
const steps = [
  { step: 1, label: "Assigned" },
  { step: 2, label: "Inspection" },
  { step: 3, label: "Pricing" },
  { step: 4, label: "OTP" },
  { step: 5, label: "Working" },
  { step: 6, label: "Done" },
];

const statusMeta = {
  provider_selected: {
    step: 1, label: "Assigned",
    color: "bg-emerald-100 text-emerald-700",
    message: "You've been selected! Send a price or request an inspection.",
  },
  inspection_requested: {
    step: 1, label: "Inspection Requested",
    color: "bg-yellow-100 text-yellow-700",
    message: "Inspection request sent. Waiting for resident to approve the fee.",
  },
  inspection_approved: {
    step: 2, label: "Inspection Approved",
    color: "bg-orange-100 text-orange-700",
    message: "Inspection approved! Go inspect, then send the final price.",
  },
  awaiting_price_approval: {
    step: 3, label: "Awaiting Price Approval",
    color: "bg-amber-100 text-amber-700",
    message: "Final price sent. Waiting for resident to approve.",
  },
  price_approved: {
    step: 4, label: "Price Approved",
    color: "bg-teal-100 text-teal-700",
    message: "Price approved by resident! Verify start OTP to begin work.",
  },
  work_in_progress: {
    step: 5, label: "Work In Progress",
    color: "bg-indigo-100 text-indigo-700",
    message: "Complete the work, then ask resident to confirm payment with complete OTP.",
  },
  completed: {
    step: 6, label: "Completed",
    color: "bg-green-100 text-green-700",
    message: "Job completed! Payment received.",
  },
  cancelled: {
    step: 0, label: "Cancelled",
    color: "bg-red-100 text-red-700",
    message: "This booking was cancelled.",
  },
};

/* ─────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────── */
function ProgressBar({ currentStep, cancelled }) {
  if (cancelled) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 bg-red-50 rounded-xl">
        <FaTimesCircle className="text-red-500" />
        <span className="text-red-600 font-medium text-sm">Job Cancelled</span>
      </div>
    );
  }
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-blue-500 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((s) => {
          const done = currentStep > s.step;
          const active = currentStep === s.step;
          return (
            <div key={s.step} className="flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                done ? "bg-blue-500 border-blue-500"
                  : active ? "bg-white border-blue-500 shadow-md shadow-blue-200"
                  : "bg-white border-gray-300"
              }`}>
                {done ? (
                  <FaCheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <span className={`text-xs font-bold ${active ? "text-blue-600" : "text-gray-400"}`}>
                    {s.step}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${
                active ? "text-blue-600" : done ? "text-gray-600" : "text-gray-400"
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   HELPER: Format schedule
───────────────────────────────────────── */
function formatSchedule(schedule) {
  if (!schedule?.scheduledStartDate) return null;
  const start = new Date(schedule.scheduledStartDate);
  const dur = schedule.estimatedDuration;
  return {
    dateStr: start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    timeStr: start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    durStr: dur ? `${dur.value} ${dur.unit}` : "",
  };
}

/* ─────────────────────────────────────────
   OTP VERIFY PANEL
───────────────────────────────────────── */
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
          <p className="text-teal-700 text-sm mt-0.5">
            Ask the resident for their Start OTP and enter it below.
          </p>
        </div>
      </div>
      <div className="flex gap-2 justify-center mb-4">
        {[0, 1, 2, 3].map((i) => (
          <input
            key={i} id={`sotp-${i}`} type="text" maxLength={1}
            value={otp[i] || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/, "");
              const arr = otp.split(""); arr[i] = val;
              setOtp(arr.join("").slice(0, 4));
              if (val && i < 3) document.getElementById(`sotp-${i + 1}`)?.focus();
            }}
            className="w-14 h-16 text-center text-2xl font-bold border-2 border-teal-200 rounded-xl focus:border-teal-500 outline-none bg-white"
          />
        ))}
      </div>
      <button onClick={() => onVerify(otp)} disabled={loading || otp.length < 4}
        className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
        Verify OTP & Begin
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMMISSION PREVIEW COMPONENT (reusable)
───────────────────────────────────────── */
function CommissionPreview({ laborCost, walletBalance = 0 }) {
  const labor = Number(laborCost) || 0;

  if (labor <= 0) return null;

  const comm = calculateCommission(labor);
  const earning = labor - comm.finalCommission;
  const hasEnough = (walletBalance - comm.finalCommission) >= 0;

  return (
    <div className={`rounded-xl p-4 border mb-4 space-y-1.5 ${
      hasEnough ? "bg-white border-green-200" : "bg-red-50 border-red-200"
    }`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Labor</span>
        <span>Rs. {labor.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">
          Commission ({comm.ratePercent})
          {comm.isNewProvider && <span className="text-green-600 ml-1">50% off!</span>}
        </span>
        <span className="text-red-600">- Rs. {comm.finalCommission.toLocaleString()}</span>
      </div>
      <div className="border-t pt-1.5 flex justify-between font-bold text-green-700">
        <span>Your Earning</span>
        <span>Rs. {earning.toLocaleString()}</span>
      </div>

      {!hasEnough && (
        <div className="bg-red-100 rounded-lg p-2 mt-2 flex items-start gap-2">
          <FaWallet className="text-red-500 mt-0.5 flex-shrink-0 w-3.5 h-3.5" />
          <p className="text-red-700 text-xs">
            Wallet needs Rs. {comm.finalCommission.toLocaleString()} for commission.
            Balance: Rs. {walletBalance.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   INSPECTION + SEND PRICE PANEL
   (Combines inspection + schedule + price)
───────────────────────────────────────── */
function InspectionAndPricePanel({ isInspection, onSubmit, loading, walletBalance }) {
  const [laborCost, setLaborCost] = useState("");
  const [scheduledStartDate, setScheduledStartDate] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("hours");
  const [error, setError] = useState("");

  const labor = Number(laborCost) || 0;
  const comm = labor > 0 ? calculateCommission(labor) : null;

  const handleSubmit = () => {
    console.log("s date",scheduledStartDate);
    
    if (!laborCost || labor <= 0) {
      setError("Please enter labor cost"); return;
    }
    if (!scheduledStartDate) {
      setError("Please select a start date/time"); return;
    }
    if (!durationValue || Number(durationValue) <= 0) {
      setError("Please enter estimated duration"); return;
    }
    if (comm && walletBalance < comm.finalCommission) {
      setError(`Need Rs. ${comm.finalCommission.toLocaleString()} in wallet for commission`);
      return;
    }
    setError("");
    onSubmit({
      laborCost: labor,
      scheduledStartDate,
      estimatedDurationValue: Number(durationValue),
      estimatedDurationUnit: durationUnit,
    });
  };

  const accentColor = isInspection ? "blue" : "purple";

  return (
    <div className={`bg-${accentColor}-50 border-2 border-${accentColor}-200 rounded-2xl p-5`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 bg-${accentColor}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
          {isInspection
            ? <FaSearch className={`text-${accentColor}-600 w-5 h-5`} />
            : <FaMoneyBillWave className={`text-${accentColor}-600 w-5 h-5`} />
          }
        </div>
        <div>
          <h3 className={`font-semibold text-${accentColor}-800`}>
            {isInspection ? "Complete Inspection & Send Price" : "Send Final Price & Schedule"}
          </h3>
          <p className={`text-${accentColor}-700 text-sm mt-0.5`}>
            {isInspection
              ? "Enter the final price after inspection."
              : "Send your final price and schedule to the resident."
            }
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-red-700 text-sm flex items-center gap-2">
          <FaExclamationTriangle />{error}
        </div>
      )}

      <div className="space-y-3 mb-4">
        {/* Labor Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Labor Cost (Rs.) <span className="text-red-500">*</span>
          </label>
          <input type="number" value={laborCost} onChange={(e) => setLaborCost(e.target.value)}
            placeholder="e.g. 2000"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm"
          />
        </div>

        {/* Schedule Section */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h4 className="font-medium text-gray-800 text-sm mb-3 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" />
            Schedule <span className="text-red-500">*</span>
          </h4>

          <div className="space-y-3">
            {/* Start Date/Time */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date & Time</label>
              <input type="datetime-local" value={scheduledStartDate}
                onChange={(e) => setScheduledStartDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            {/* Duration */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                <input type="number" value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  placeholder="e.g. 3" min="1"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none text-sm"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button type="button" onClick={() => setDurationUnit("hours")}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                      durationUnit === "hours" ? "bg-blue-600 text-white" : "bg-white text-gray-600"
                    }`}
                  >Hours</button>
                  <button type="button" onClick={() => setDurationUnit("days")}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                      durationUnit === "days" ? "bg-blue-600 text-white" : "bg-white text-gray-600"
                    }`}
                  >Days</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Preview */}
      <CommissionPreview
        laborCost={laborCost}
        walletBalance={walletBalance}
      />

      <button onClick={handleSubmit} disabled={loading}
        className={`w-full py-3 bg-gradient-to-r from-${accentColor}-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60`}
      >
        {loading ? <FaSpinner className="animate-spin" /> : <FaMoneyBillWave />}
        Send Price & Schedule to Resident
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   REQUEST INSPECTION PANEL (re-request mid-chat)
───────────────────────────────────────── */
function RequestInspectionPanel({ onRequest, loading }) {
  const [fee, setFee] = useState("");
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)}
        className="w-full py-3 bg-amber-50 border-2 border-amber-200 text-amber-700 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-amber-100 transition-all"
      >
        <FaSearch className="w-4 h-4" />
        Request Inspection
      </button>
    );
  }

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaSearch className="text-amber-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-800">Request Inspection</h3>
          <p className="text-amber-700 text-sm mt-0.5">
            Need to visit and inspect before giving final price? Request here.
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inspection Fee (Rs.)
          </label>
          <input type="number" value={fee} onChange={(e) => setFee(e.target.value)}
            placeholder="e.g. 300" min="0"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Why do you need to inspect? E.g., 'Need to check wiring behind the wall'"
            rows={2} maxLength={200}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none text-sm resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setExpanded(false)}
          className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button onClick={() => onRequest({ fee: Number(fee) || 0, message })}
          disabled={loading}
          className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
          Send Request
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PRICE REVISION PANEL (during work)
───────────────────────────────────────── */
function PriceRevisionPanel({ booking, onSubmit, loading, walletBalance }) {
  const [expanded, setExpanded] = useState(false);
  const [laborCost, setLaborCost] = useState(booking.finalPrice?.laborCost?.toString() || "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)}
        className="w-full py-3 bg-orange-50 border-2 border-orange-200 text-orange-700 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-orange-100 transition-all"
      >
        <FaEdit className="w-4 h-4" />
        Update Price
      </button>
    );
  }

  const labor = Number(laborCost) || 0;
  const comm = labor > 0 ? calculateCommission(labor) : null;

  const handleSubmit = () => {
    if (!laborCost || labor <= 0) { setError("Enter labor cost"); return; }
    setError("");
    onSubmit({
      laborCost: labor,
      reason,
    });
    setExpanded(false);
  };

  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaEdit className="text-orange-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-orange-800">Update Price</h3>
          <p className="text-orange-700 text-sm mt-0.5">
            Discuss with resident first, then submit the revised price for approval.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-red-700 text-sm flex items-center gap-2">
          <FaExclamationTriangle />{error}
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Labor Cost (Rs.)</label>
          <input type="number" value={laborCost} onChange={(e) => setLaborCost(e.target.value)}
            placeholder="e.g. 3000"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Change <span className="text-red-500">*</span>
          </label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="E.g., Found additional wiring issue behind the wall"
            rows={2} maxLength={300}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none text-sm resize-none"
          />
        </div>
      </div>

      <CommissionPreview laborCost={laborCost} walletBalance={walletBalance} />

      <div className="flex gap-3">
        <button onClick={() => setExpanded(false)}
          className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50"
        >Cancel</button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaEdit />}
          Submit Revision
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SCHEDULE UPDATE PANEL (during work)
───────────────────────────────────────── */
function UpdateSchedulePanel({ booking, onSubmit, loading }) {
  const [expanded, setExpanded] = useState(false);
  const [durationValue, setDurationValue] = useState(
    booking.schedule?.estimatedDuration?.value?.toString() || ""
  );
  const [durationUnit, setDurationUnit] = useState(
    booking.schedule?.estimatedDuration?.unit || "hours"
  );
  const [startDate, setStartDate] = useState("");

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)}
        className="w-full py-3 bg-purple-50 border-2 border-purple-200 text-purple-700 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-purple-100 transition-all"
      >
        <FaCalendarAlt className="w-4 h-4" />
        Update Schedule
      </button>
    );
  }

  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaCalendarAlt className="text-purple-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-purple-800">Update Schedule</h3>
          <p className="text-purple-700 text-sm mt-0.5">
            Need more time? Update the schedule — resident approval required.
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            New Start Date (optional)
          </label>
          <input type="datetime-local" value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 outline-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">New Duration</label>
            <input type="number" value={durationValue}
              onChange={(e) => setDurationValue(e.target.value)}
              placeholder="e.g. 5" min="1"
              className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 outline-none text-sm"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
            <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
              <button type="button" onClick={() => setDurationUnit("hours")}
                className={`flex-1 py-2.5 text-sm font-medium ${
                  durationUnit === "hours" ? "bg-purple-600 text-white" : "bg-white text-gray-600"
                }`}
              >Hours</button>
              <button type="button" onClick={() => setDurationUnit("days")}
                className={`flex-1 py-2.5 text-sm font-medium ${
                  durationUnit === "days" ? "bg-purple-600 text-white" : "bg-white text-gray-600"
                }`}
              >Days</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setExpanded(false)}
          className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50"
        >Cancel</button>
        <button
          onClick={() => {
            onSubmit({
              estimatedDurationValue: Number(durationValue),
              estimatedDurationUnit: durationUnit,
              ...(startDate && { scheduledStartDate: startDate }),
            });
            setExpanded(false);
          }}
          disabled={loading}
          className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaCalendarAlt />}
          Update
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   START WORK PANEL
───────────────────────────────────────── */
function StartWorkPanel({ onStart, loading }) {
  return (
    <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-5 text-center">
      <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <FaTools className="w-7 h-7 text-teal-600" />
      </div>
      <h3 className="font-semibold text-teal-800 mb-1">Ready to Start?</h3>
      <p className="text-teal-700 text-sm mb-4">OTP verified! Click below to officially start the work.</p>
      <button onClick={onStart} disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <FaSpinner className="animate-spin" /> : <FaTools />}
        Start Work Now
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPLETE WORK PANEL
───────────────────────────────────────── */
function CompleteWorkPanel({ booking, onComplete, loading }) {
  const code = booking.otp?.complete?.code;
  return (
    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaShieldAlt className="text-indigo-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-indigo-800">Work In Progress</h3>
          <p className="text-indigo-700 text-sm mt-0.5">
            Show the Complete OTP to the resident. They'll confirm payment.
          </p>
        </div>
      </div>
      {code && (
        <div className="bg-white rounded-xl p-4 border-2 border-indigo-200 text-center mb-4">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Complete OTP (Show to Resident)</p>
          <div className="flex items-center justify-center gap-2">
            {code.split("").map((d, i) => (
              <div key={i} className="w-14 h-16 bg-indigo-50 rounded-xl flex items-center justify-center text-3xl font-bold text-indigo-700 border-2 border-indigo-200">
                {d}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Resident enters this to release payment</p>
        </div>
      )}
      <button onClick={onComplete} disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
        Mark Work Completed
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPLETED PANEL
───────────────────────────────────────── */
function CompletedPanel({ booking }) {
  const labor = booking.finalPrice?.laborCost || 0;
  const commission = booking.commission?.amount || 0;
  const earning = booking.providerEarning || labor - commission;
  const discount = booking.commission?.discount;

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <FaCheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-green-800 mb-1">Job Completed! 🎉</h3>
      <p className="text-green-700 text-sm mb-4">Payment confirmed.</p>
      <div className="bg-white rounded-xl p-4 border border-green-200 text-left space-y-2">
        <p className="font-semibold text-gray-700 mb-2 text-sm">Payment Summary</p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Labor Cost</span>
          <span>Rs. {labor.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Commission
            {discount > 0 && <span className="text-green-600 ml-1">({discount}% off)</span>}
          </span>
          <span className="text-red-600">- Rs. {commission.toLocaleString()}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-green-700">
          <span>Your Earning</span>
          <span className="text-lg">Rs. {earning.toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-400">
          Payment via <span className="capitalize">{booking.paymentMethod}</span>
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CANCELLED PANEL
───────────────────────────────────────── */
function CancelledPanel({ booking }) {
  const penalty = booking.cancellationPenalty;
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaTimesCircle className="text-red-600 w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-800">Job Cancelled</h3>
          <p className="text-red-700 text-sm mt-0.5">
            Cancelled by: <span className="capitalize font-medium">{booking.cancelledBy}</span>
          </p>
          {booking.cancellationReason && (
            <p className="text-red-600 text-sm mt-1">Reason: {booking.cancellationReason}</p>
          )}
          {penalty && penalty.amount > 0 && (
            <div className="mt-3 bg-red-100 rounded-xl p-3">
              <p className="text-red-800 text-sm font-semibold">
                Penalty: Rs. {penalty.amount?.toLocaleString()}
              </p>
              <p className="text-red-700 text-xs">
                Paid by: <span className="capitalize">{penalty.paidBy}</span>
              </p>
              {penalty.reason && <p className="text-red-600 text-xs mt-1">{penalty.reason}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PRICE REVISION HISTORY (sidebar)
───────────────────────────────────────── */
function RevisionHistory({ revisions }) {
  if (!revisions || revisions.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
        <FaHistory className="text-gray-500 w-4 h-4" />
        Price Changes ({revisions.length})
      </h3>
      <div className="space-y-2">
        {revisions.map((rev, i) => (
          <div key={rev._id || i} className="text-sm p-2.5 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rs. {rev.totalAmount?.toLocaleString()}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                rev.status === "approved" ? "bg-green-100 text-green-700"
                  : rev.status === "rejected" ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>{rev.status}</span>
            </div>
            {rev.reason && <p className="text-gray-400 text-xs mt-1">{rev.reason}</p>}
            <p className="text-gray-300 text-xs mt-0.5">
              {new Date(rev.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════ */
export default function JobDetails() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchJob();
    fetchWallet();
  }, [bookingId, user]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await getJobDetails(bookingId);
      setBooking(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchWallet = async () => {
    try {
      const res = await getProviderWallet();
      const w = res.data.data;
      setWalletBalance(w.availableBalance ?? (w.balance - (w.lockedAmount || 0)));
    } catch (err) { console.error(err); }
  };

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  /* ── Action Handlers ── */
  const handleVerifyOTP = async (otp) => {
    try {
      setActionLoading(true);
      await verifyStartOTP(bookingId, { otp });
      showAlert("success", "Start OTP verified!");
      fetchJob();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Invalid OTP");
    } finally { setActionLoading(false); }
  };

  const handleCompleteInspection = async (data) => {
    try {
      setActionLoading(true);
      const res = await completeInspection(bookingId, data);
      const info = res.data.data?.commissionInfo;
      showAlert("success",
        info ? `Price sent! Your earning: Rs. ${info.yourEarning?.toLocaleString()}`
          : "Price sent to resident!"
      );
      fetchJob(); fetchWallet();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed");
    } finally { setActionLoading(false); }
  };

  const handleSendPrice = async (data) => {
    try {
      setActionLoading(true);
      const res = await sendFinalPrice(bookingId, data);
      const info = res.data.data?.commissionInfo;
      showAlert("success",
        info ? `Price sent! Your earning: Rs. ${info.yourEarning?.toLocaleString()}`
          : "Price sent to resident!"
      );
      fetchJob(); fetchWallet();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to send price");
    } finally { setActionLoading(false); }
  };

  const handleStartWork = async () => {
    try {
      setActionLoading(true);
      const res = await startWork(bookingId);
      showAlert("success", `Work started! Complete OTP: ${res.data.data.completeOTP}`);
      fetchJob();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to start work");
    } finally { setActionLoading(false); }
  };

  const handleCompleteWork = async () => {
    try {
      setActionLoading(true);
      await completeWork(bookingId);
      showAlert("success", "Work marked complete! Ask resident to confirm with OTP.");
      fetchJob();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed");
    } finally { setActionLoading(false); }
  };

  const handleRequestInspection = async (data) => {
    try {
      setActionLoading(true);
      await requestInspection(bookingId, data);
      showAlert("success", "Inspection requested! Waiting for resident approval.");
      fetchJob();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed");
    } finally { setActionLoading(false); }
  };

  const handleUpdatePrice = async (data) => {
    try {
      setActionLoading(true);
      await updatePriceDuringWork(bookingId, data);
      showAlert("success", "Price revision sent to resident for approval.");
      fetchJob(); fetchWallet();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to update price");
    } finally { setActionLoading(false); }
  };

  const handleUpdateSchedule = async (data) => {
    try {
      setActionLoading(true);
      await updateSchedule(bookingId, data);
      showAlert("success", "Schedule update sent for resident approval.");
      fetchJob();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to update schedule");
    } finally { setActionLoading(false); }
  };

  const handleCancelJob = async () => {
    try {
      setActionLoading(true);
      const res = await providerCancelJob(bookingId, { reason: cancelReason });
      const penalty = res.data.data?.penalty;
      setShowCancelModal(false);
      showAlert("success",
        penalty?.amount > 0
          ? `Job cancelled. Penalty: Rs. ${penalty.amount.toLocaleString()}`
          : "Job cancelled. No penalty applied."
      );
      fetchJob(); fetchWallet();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to cancel");
    } finally { setActionLoading(false); }
  };

  const handleRespondToCounter = async (action, newFee) => {
    try {
      setActionLoading(true);
      await respondToCounterFee(bookingId, { action, fee: newFee });
      const msg = action === "accept" ? "Counter offer accepted!" : "New fee proposed!";
      showAlert("success", msg);
      fetchJob();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed");
    } finally { setActionLoading(false); }
  };

  /* ── Loading / Not Found ── */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FaClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Job not found</h2>
            <button onClick={() => navigate("/provider/my-jobs")} className="text-blue-600 hover:underline">
              Back to My Jobs
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const meta = statusMeta[booking.status] || statusMeta.provider_selected;
  const isCancelled = booking.status === "cancelled";
  const otpVerified = booking.otp?.start?.verified;
  const inspectionDone = booking.inspection?.completedByProvider;
  const schedule = formatSchedule(booking.schedule);
  const canCancel = !["completed", "cancelled"].includes(booking.status);
  const canRequestInspection = booking.status === "provider_selected" && !booking.inspection?.requested;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Alert */}
          {alertMsg && (
            <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${
              alertMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {alertMsg.type === "success" ? <FaCheckCircle className="mt-0.5" /> : <FaExclamationTriangle className="mt-0.5" />}
              <p className="text-sm font-medium">{alertMsg.text}</p>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate("/provider/my-jobs")}
              className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
            >
              <FaArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-mono">
                #{booking.bookingId || booking._id?.slice(-8).toUpperCase()}
              </p>
              <h1 className="text-xl font-bold text-gray-800">Job Details</h1>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${meta.color}`}>
              {meta.label}
            </span>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <ProgressBar currentStep={meta.step} cancelled={isCancelled} />
            <div className={`mt-4 p-3 rounded-xl text-sm ${meta.color}`}>{meta.message}</div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">

              {/* Job Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaClipboardList className="text-blue-600" />
                  Job Description
                </h3>
                {booking.category && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-3">
                    {booking.category.name}
                  </span>
                )}
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{booking.description}</p>
                {booking.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {booking.images.map((img, i) => (
                      <img key={i} src={`${import.meta.env.VITE_BASE_URL}/${img}`} alt=""
                        className="w-24 h-24 rounded-xl object-cover border border-gray-200"
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-start gap-2 text-gray-600 bg-gray-50 rounded-xl p-3">
                  <FaMapMarkerAlt className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{booking.address}</span>
                </div>
              </div>

              {/* provider_selected: Send Price directly */}
              {booking.status === "provider_selected" && !booking.inspection?.requested && (
                <InspectionAndPricePanel
                  isInspection={false}
                  onSubmit={handleSendPrice}
                  loading={actionLoading}
                  walletBalance={walletBalance}
                />
              )}

              {/* inspection_requested: Waiting for resident */}
              {booking.status === "inspection_requested" && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 text-center">
                  <FaClock className="w-10 h-10 text-yellow-500 mx-auto mb-3 animate-pulse" />
                  <h3 className="font-semibold text-yellow-800 mb-1">Waiting for Resident</h3>
                  <p className="text-yellow-700 text-sm">
                    {booking.inspection?.status === "counter_offered"
                      ? `Resident countered with Rs. ${booking.inspection.counterFee}. Accept or re-propose.`
                      : `Inspection fee: Rs. ${booking.inspection?.fee?.toLocaleString() || 0}. Waiting for approval.`
                    }
                  </p>
                  {booking.inspection?.status === "counter_offered" && (
                    <div className="mt-3 flex gap-2 justify-center">
                      <button
                        onClick={() => handleRespondToCounter("accept")}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl font-medium text-sm hover:bg-green-600 disabled:opacity-60"
                      >Accept Rs. {booking.inspection.counterFee}</button>
                      <button
                        onClick={() => {
                          const newFee = prompt("Enter your new proposed fee:");
                          if (newFee) handleRespondToCounter("re_propose", Number(newFee));
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 disabled:opacity-60"
                      >Re-propose</button>
                    </div>
                  )}
                </div>
              )}

              {/* inspection_approved: Complete inspection + send price */}
              {booking.status === "inspection_approved" && (
                <InspectionAndPricePanel
                  isInspection={true}
                  onSubmit={handleCompleteInspection}
                  loading={actionLoading}
                  walletBalance={walletBalance}
                />
              )}

              {/* inspection_scheduled (legacy) / inspection_approved: Verify OTP if applicable  */}

              {/* price_approved: Verify start OTP */}
              {booking.status === "price_approved" && !otpVerified && (
                <VerifyOTPPanel onVerify={handleVerifyOTP} loading={actionLoading} />
              )}

              {/* price_approved + OTP verified: Start Work */}
              {booking.status === "price_approved" && otpVerified && (
                <StartWorkPanel onStart={handleStartWork} loading={actionLoading} />
              )}

              {/* work_in_progress */}
              {booking.status === "work_in_progress" && (
                <>
                  <CompleteWorkPanel booking={booking} onComplete={handleCompleteWork} loading={actionLoading} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PriceRevisionPanel
                      booking={booking} onSubmit={handleUpdatePrice}
                      loading={actionLoading} walletBalance={walletBalance}
                    />
                    <UpdateSchedulePanel
                      booking={booking} onSubmit={handleUpdateSchedule} loading={actionLoading}
                    />
                  </div>
                </>
              )}

              {/* awaiting_price_approval: Waiting */}
              {booking.status === "awaiting_price_approval" && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-center">
                  <FaClock className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-pulse" />
                  <h3 className="font-semibold text-amber-800 mb-1">Waiting for Resident Approval</h3>
                  <p className="text-amber-700 text-sm">Price & schedule sent. Resident will review shortly.</p>
                  {booking.finalPrice?.totalAmount > 0 && (
                    <div className="mt-3 bg-white rounded-xl p-3 border border-amber-200 inline-block">
                      <p className="text-sm text-gray-600">
                        Quoted: <span className="font-bold text-gray-800">Rs. {booking.finalPrice.totalAmount.toLocaleString()}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Request Inspection (when allowed) */}
              {canRequestInspection && (
                <RequestInspectionPanel onRequest={handleRequestInspection} loading={actionLoading} />
              )}

              {/* completed */}
              {booking.status === "completed" && <CompletedPanel booking={booking} />}

              {/* cancelled */}
              {booking.status === "cancelled" && <CancelledPanel booking={booking} />}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">

              {/* Resident Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                  <FaUser className="text-blue-600 w-4 h-4" /> Resident
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                    <FaUser className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{booking.resident?.name || "Resident"}</p>
                    <p className="text-xs text-gray-500">{booking.resident?.phone || "No phone"}</p>
                  </div>
                </div>
                {booking.resident?.phone && (
                  <a href={`tel:${booking.resident.phone}`}
                    className="w-full py-2.5 bg-green-50 text-green-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-100 border border-green-200 text-sm"
                  >
                    <FaPhone className="w-3.5 h-3.5" /> Call Resident
                  </a>
                )}
                <button onClick={() => navigate(`/provider/chat/${booking._id}`)}
                  className="w-full mt-3 py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700"
                >
                  💬 Message Resident
                </button>
              </div>

              {/* Job Summary Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Job Summary</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>{meta.label}</span>
                  </div>
                  {booking.inspection?.required && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Inspection Fee</span>
                      <span className="font-medium">Rs. {booking.inspection.fee || 0}</span>
                    </div>
                  )}
                  {booking.finalPrice?.laborCost > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Labor Cost</span>
                        <span className="font-medium">Rs. {booking.finalPrice.laborCost.toLocaleString()}</span>
                      </div>
                      {booking.finalPrice.materialCost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Materials</span>
                          <span className="font-medium">Rs. {booking.finalPrice.materialCost.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Commission</span>
                        <span className="text-red-600 font-medium">
                          - Rs. {(booking.commission?.amount || 0).toLocaleString()}
                          {booking.commission?.discount > 0 && (
                            <span className="text-green-600 ml-1 text-xs">({booking.commission.discount}% off)</span>
                          )}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-green-700">
                        <span>Your Earning</span>
                        <span>
                          Rs. {(
                            (booking.finalPrice.totalAmount || 0) - (booking.commission?.amount || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Schedule */}
                  {schedule && (
                    <div className="border-t pt-2 mt-2 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-600 w-3 h-3" />
                        <span className="text-gray-500 text-xs">Schedule</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Start</span>
                        <span className="text-gray-700 text-xs">{schedule.dateStr} {schedule.timeStr}</span>
                      </div>
                      {schedule.durStr && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Duration</span>
                          <span className="text-gray-700">{schedule.durStr}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Approved</span>
                        {booking.schedule?.approvedByResident
                          ? <span className="text-green-600 flex items-center gap-1 text-xs"><FaCheckCircle className="w-3 h-3" /> Yes</span>
                          : <span className="text-amber-600 flex items-center gap-1 text-xs"><FaClock className="w-3 h-3" /> Pending</span>
                        }
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-1 border-t">
                    <span className="text-gray-500">Posted</span>
                    <span className="text-gray-600">
                      {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <FaWallet className="text-green-600 w-4 h-4" /> Wallet
                </h3>
                <p className="text-lg font-bold text-green-600">Rs. {walletBalance.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Available balance</p>
                {booking.commission?.locked && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <FaInfoCircle className="w-3 h-3" />
                    Rs. {booking.commission.amount?.toLocaleString()} locked for this job
                  </p>
                )}
              </div>

              {/* OTP Status */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">OTP Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Start OTP</span>
                    {booking.otp?.start?.verified
                      ? <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><FaCheckCircle /> Verified</span>
                      : <span className="flex items-center gap-1 text-gray-400 text-xs"><FaClock /> Pending</span>
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Complete OTP</span>
                    {booking.otp?.complete?.verified
                      ? <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><FaCheckCircle /> Verified</span>
                      : <span className="flex items-center gap-1 text-gray-400 text-xs"><FaClock /> Pending</span>
                    }
                  </div>
                </div>
              </div>

              {/* Price Revision History */}
              <RevisionHistory revisions={booking.priceRevisions} />

              {/* Cancel Button */}
              {canCancel && (
                <button onClick={() => setShowCancelModal(true)}
                  className="w-full py-3 border-2 border-red-200 text-red-600 rounded-2xl font-medium hover:bg-red-50 hover:border-red-400 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <FaBan className="w-4 h-4" /> Cancel Job
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1 text-center">Cancel This Job?</h3>
            <p className="text-gray-500 text-sm text-center mb-3">This action cannot be undone.</p>

            {/* Penalty Warnings */}
            {booking.inspection?.completedByProvider && booking.status !== "work_in_progress" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                <p className="text-amber-700 text-sm">⚠️ Inspection completed. Rs. 300 penalty will apply.</p>
              </div>
            )}
            {booking.status === "work_in_progress" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                <p className="text-red-700 text-sm">
                  ⚠️ Work in progress. 60% of labor estimate (Rs. {
                    Math.round((booking.finalPrice?.laborCost || 0) * 0.6).toLocaleString()
                  }) will be deducted as penalty.
                </p>
              </div>
            )}
            {!booking.inspection?.completedByProvider && booking.status !== "work_in_progress" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
                <p className="text-green-700 text-sm">✅ No penalty — cancelling before inspection.</p>
              </div>
            )}

            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 outline-none mb-4 resize-none text-sm"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >Keep Job</button>
              <button onClick={handleCancelJob} disabled={actionLoading}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {actionLoading ? <FaSpinner className="animate-spin" /> : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}