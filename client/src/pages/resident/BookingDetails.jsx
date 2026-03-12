import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaTools,
  FaClipboardList,
  FaKey,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaSearch,
  FaBell,
  FaShieldAlt,
  FaCalendarAlt,
  FaEdit,
  FaHistory,
} from "react-icons/fa";
import {
  getBookingDetails,
  acceptOffer,
  respondToInspection,
  approveFinalPrice,
  rejectFinalPrice,
  confirmPayment,
  cancelBooking,
  approvePriceRevision,
  approveScheduleUpdate,
} from "../../api/residentsEndpoints";

/* ─────────────────────────────────────────
   STATUS META
───────────────────────────────────────── */
const statusMeta = {
  posted: {
    label: "Waiting for Offers",
    color: "bg-blue-100 text-blue-700",
    step: 1,
    icon: FaClock,
    message: "Your job is live! Workers are reviewing it and will send offers soon.",
  },
  offers_received: {
    label: "Offers Received",
    color: "bg-purple-100 text-purple-700",
    step: 2,
    icon: FaBell,
    message: "You have received offers! Review them below and accept the best one.",
  },
  provider_selected: {
    label: "Worker Selected",
    color: "bg-emerald-100 text-emerald-700",
    step: 3,
    icon: FaCheckCircle,
    message: "Worker selected! They will either send a price or request an inspection.",
  },
  inspection_requested: {
    label: "Inspection Requested",
    color: "bg-yellow-100 text-yellow-700",
    step: 3,
    icon: FaSearch,
    message: "Worker wants to inspect before giving a final price. Review the inspection fee.",
  },
  inspection_approved: {
    label: "Inspection Approved",
    color: "bg-orange-100 text-orange-700",
    step: 3,
    icon: FaClock,
    message: "Inspection approved! Worker will visit to assess the problem.",
  },
  awaiting_price_approval: {
    label: "Price Approval Needed",
    color: "bg-amber-100 text-amber-700",
    step: 4,
    icon: FaMoneyBillWave,
    message: "Worker has sent the final price and schedule. Review and approve to proceed.",
  },
  price_approved: {
    label: "Price Approved",
    color: "bg-teal-100 text-teal-700",
    step: 5,
    icon: FaKey,
    message: "Share the Start OTP with the worker when they arrive to begin work.",
  },
  work_in_progress: {
    label: "Work In Progress",
    color: "bg-indigo-100 text-indigo-700",
    step: 6,
    icon: FaTools,
    message: "Worker is currently working. Once done, enter the Complete OTP to confirm payment.",
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700",
    step: 7,
    icon: FaCheckCircle,
    message: "Job completed successfully! Please leave a review for the worker.",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    step: 0,
    icon: FaTimesCircle,
    message: "This booking has been cancelled.",
  },
};

/* ─────────────────────────────────────────
   PROGRESS STEPS
───────────────────────────────────────── */
const lifecycleSteps = [
  { step: 1, label: "Posted" },
  { step: 2, label: "Offers" },
  { step: 3, label: "Inspection" },
  { step: 4, label: "Pricing" },
  { step: 5, label: "Approved" },
  { step: 6, label: "Working" },
  { step: 7, label: "Done" },
];

function ProgressBar({ currentStep, cancelled }) {
  if (cancelled) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 bg-red-50 rounded-xl">
        <FaTimesCircle className="text-red-500" />
        <span className="text-red-600 font-medium text-sm">Booking Cancelled</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-blue-500 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (lifecycleSteps.length - 1)) * 100}%` }}
        />
        {lifecycleSteps.map((s) => {
          const done = currentStep > s.step;
          const active = currentStep === s.step;
          return (
            <div key={s.step} className="flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
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
  const dateStr = start.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
  const timeStr = start.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
  const durStr = dur
    ? `${dur.value} ${dur.unit}`
    : "";

  return { dateStr, timeStr, durStr, start };
}

/* ─────────────────────────────────────────
   OFFER CARD  (unchanged — just showing for completeness)
───────────────────────────────────────── */
function OfferCard({ offer, onAccept, actionLoading }) {
  return (
    <div className="border-2 border-gray-200 hover:border-blue-300 rounded-2xl p-4 transition-all">
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
          {offer.provider?.profileImage ? (
            <img
              src={`${import.meta.env.VITE_BASE_URL}/${offer.provider.profileImage}`}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaUser className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h4 className="font-semibold text-gray-800">
                {offer.provider?.userId?.name || "Worker"}
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                <div className="flex items-center gap-1 text-yellow-500">
                  <FaStar className="w-3 h-3" />
                  <span className="text-gray-600">
                    {offer.provider?.rating?.toFixed(1) || "New"}
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <span>{offer.provider?.completedJobs || 0} jobs done</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-bold text-blue-600">
                Rs. {offer.laborEstimate?.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">labor estimate</p>
            </div>
          </div>

          {offer.message && (
            <p className="text-gray-600 text-sm bg-gray-50 rounded-xl p-3 mb-3 italic">
              "{offer.message}"
            </p>
          )}



          <button
            onClick={() => onAccept(offer._id)}
            disabled={actionLoading}
            className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
            Accept This Offer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   INSPECTION REQUESTED PANEL (negotiation)
───────────────────────────────────────── */
function InspectionRequestedPanel({ booking, onRespond, actionLoading }) {
  const [counterFee, setCounterFee] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const isCounterOffer = booking.inspection?.status === "counter_offered";

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaSearch className="text-amber-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-800">Inspection Requested</h3>
          <p className="text-amber-700 text-sm mt-0.5">
            Worker wants to inspect before providing a final price.
          </p>
        </div>
      </div>

      {booking.inspection?.message && (
        <div className="bg-white rounded-xl p-3 mb-3 border border-amber-200">
          <p className="text-xs text-gray-400 mb-1">Worker's message:</p>
          <p className="text-gray-700 text-sm italic">"{booking.inspection.message}"</p>
        </div>
      )}

      {isCounterOffer && (
        <div className="bg-blue-50 rounded-xl p-3 mb-3 border border-blue-200">
          <p className="text-blue-700 text-sm">⏳ Your counter offer of Rs. {booking.inspection.counterFee} was sent. Waiting for worker's response.</p>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 mb-4 border border-amber-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Proposed Inspection Fee</span>
          <span className="font-bold text-gray-800 text-lg">
            Rs. {(booking.inspection?.fee || 0).toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">This fee applies even if you cancel after inspection</p>
      </div>

      {!isCounterOffer && (
        <>
          {showCounter ? (
            <div className="bg-white rounded-xl p-4 mb-4 border border-amber-200 space-y-3">
              <label className="text-sm font-medium text-gray-700">Your Counter Fee (Rs.)</label>
              <input
                type="number" value={counterFee}
                onChange={(e) => setCounterFee(e.target.value)}
                placeholder="e.g. 500"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-400 outline-none text-sm"
              />
              <textarea
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                placeholder="Message (optional)"
                rows={2}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-400 outline-none text-sm resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowCounter(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm">Back</button>
                <button
                  onClick={() => onRespond("counter", Number(counterFee), counterMessage)}
                  disabled={actionLoading || !counterFee}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                  Send Counter Offer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => onRespond("reject")} disabled={actionLoading}
                className="flex-1 py-3 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 disabled:opacity-60">
                <FaTimesCircle className="inline mr-1" /> Reject
              </button>
              <button onClick={() => setShowCounter(true)}
                className="flex-1 py-3 border-2 border-blue-300 text-blue-600 rounded-xl font-medium hover:bg-blue-50">
                💬 Counter
              </button>
              <button
                onClick={() => onRespond("approve")} disabled={actionLoading}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-1">
                {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Approve
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   INSPECTION APPROVED PANEL (waiting for inspection)
───────────────────────────────────────── */
function InspectionApprovedPanel({ booking }) {
  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaClock className="text-orange-600 w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-semibold text-orange-800">Inspection Approved</h3>
          <p className="text-orange-700 text-sm mt-0.5">
            Agreed fee: Rs. {(booking.inspection?.agreedFee || 0).toLocaleString()}. Worker will visit to inspect.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PRICE APPROVAL PANEL  ★ UPDATED with schedule
───────────────────────────────────────── */
function PriceApprovalPanel({ booking, onApprove, onReject, actionLoading }) {
  const labor = booking.finalPrice?.laborCost || 0;
  const schedule = formatSchedule(booking.schedule);

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaMoneyBillWave className="text-blue-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-800">Final Price & Schedule</h3>
          <p className="text-blue-700 text-sm mt-0.5">
            Review the labor cost and schedule, then approve to proceed.
          </p>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white rounded-xl p-4 mb-3 border border-blue-200 space-y-2">
        <div className="flex justify-between">
          <span className="font-bold text-gray-800">Labor Cost</span>
          <span className="font-bold text-xl text-blue-600">Rs. {labor.toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-400">Materials (if any) are arranged separately outside the platform</p>
      </div>

      {/* Schedule Info */}
      {schedule && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <FaCalendarAlt className="text-blue-600 w-4 h-4" />
            <span className="font-medium text-gray-800 text-sm">Schedule</span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Start:</span>
              <span className="font-medium text-gray-800">
                {schedule.dateStr} at {schedule.timeStr}
              </span>
            </div>
            {schedule.durStr && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium text-gray-800">{schedule.durStr}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onReject}
          disabled={actionLoading}
          className="flex-1 py-3 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all disabled:opacity-60"
        >
          <FaTimesCircle className="inline mr-2" />
          Reject
        </button>
        <button
          onClick={onApprove}
          disabled={actionLoading}
          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
          Approve
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ★ NEW: PRICE REVISION PANEL (during work)
───────────────────────────────────────── */
function PriceRevisionPanel({ booking, onApprove, onReject, actionLoading }) {
  const pendingRevisions = (booking.priceRevisions || []).filter(
    (r) => r.status === "pending"
  );

  if (pendingRevisions.length === 0) return null;

  const revision = pendingRevisions[pendingRevisions.length - 1]; // latest
  const oldTotal = booking.finalPrice?.totalAmount || 0;
  const diff = revision.totalAmount - oldTotal;

  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaEdit className="text-orange-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-orange-800">Price Revision Request</h3>
          <p className="text-orange-700 text-sm mt-0.5">
            Worker has requested a price change during the work.
          </p>
        </div>
      </div>

      {/* Reason */}
      {revision.reason && (
        <div className="bg-white rounded-xl p-3 mb-3 border border-orange-200">
          <p className="text-xs text-gray-400 mb-1">Reason:</p>
          <p className="text-gray-700 text-sm italic">"{revision.reason}"</p>
        </div>
      )}

      {/* Comparison */}
      <div className="bg-white rounded-xl p-4 mb-4 border border-orange-200 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Previous Total</span>
          <span className="text-gray-500 line-through">Rs. {oldTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">New Labor Cost</span>
          <span className="font-medium">Rs. {revision.laborCost?.toLocaleString()}</span>
        </div>

        <div className="border-t pt-2 flex justify-between">
          <span className="font-bold text-gray-800">New Total</span>
          <span className="font-bold text-xl text-orange-600">
            Rs. {revision.totalAmount?.toLocaleString()}
          </span>
        </div>
        <div className={`text-sm text-center py-1 rounded-lg ${
          diff > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
        }`}>
          {diff > 0 ? `+Rs. ${diff.toLocaleString()} increase` : `Rs. ${Math.abs(diff).toLocaleString()} decrease`}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onReject(revision._id)}
          disabled={actionLoading}
          className="flex-1 py-3 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all disabled:opacity-60"
        >
          Reject Change
        </button>
        <button
          onClick={() => onApprove(revision._id)}
          disabled={actionLoading}
          className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
          Approve Change
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ★ NEW: SCHEDULE UPDATE PANEL
───────────────────────────────────────── */
function ScheduleUpdatePanel({ booking, onApprove, actionLoading }) {
  if (booking.schedule?.approvedByResident) return null;
  if (!booking.schedule?.scheduledStartDate) return null;

  const schedule = formatSchedule(booking.schedule);
  if (!schedule) return null;

  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaCalendarAlt className="text-purple-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-purple-800">Schedule Update</h3>
          <p className="text-purple-700 text-sm mt-0.5">
            Worker has updated the schedule. Please review and approve.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4 border border-purple-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-gray-500 block text-xs mb-1">Start Date</span>
            <span className="font-semibold text-gray-800">
              {schedule.dateStr} at {schedule.timeStr}
            </span>
          </div>
          {schedule.durStr && (
            <div>
              <span className="text-gray-500 block text-xs mb-1">Duration</span>
              <span className="font-semibold text-gray-800">{schedule.durStr}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onApprove}
        disabled={actionLoading}
        className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
        Approve Schedule
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   START OTP PANEL (unchanged)
───────────────────────────────────────── */
function StartOTPPanel({ booking }) {
  const [copied, setCopied] = useState(false);
  const code = booking.otp?.start?.code || "----";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schedule = formatSchedule(booking.schedule);

  return (
    <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaKey className="text-teal-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-teal-800">Start OTP</h3>
          <p className="text-teal-700 text-sm mt-0.5">
            Share this OTP with the worker when they arrive.
          </p>
        </div>
      </div>

      {/* Schedule Info */}
      {schedule && (
        <div className="bg-white rounded-xl p-3 mb-3 border border-teal-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaCalendarAlt className="text-teal-600 w-3 h-3" />
            <span>Scheduled: {schedule.dateStr} at {schedule.timeStr}</span>
            {schedule.durStr && <span className="text-gray-400">• {schedule.durStr}</span>}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 border-2 border-teal-200 text-center mb-3">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Start OTP</p>
        <div className="flex items-center justify-center gap-3">
          {code.split("").map((digit, i) => (
            <div
              key={i}
              className="w-14 h-16 bg-teal-50 rounded-xl flex items-center justify-center text-3xl font-bold text-teal-700 border-2 border-teal-200"
            >
              {digit}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="w-full py-2.5 border-2 border-teal-300 text-teal-700 rounded-xl font-medium hover:bg-teal-100 transition-all"
      >
        {copied ? "✅ Copied!" : "📋 Copy OTP"}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   CONFIRM PAYMENT PANEL (unchanged logic)
───────────────────────────────────────── */
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
                if (val && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
              }}
              id={`otp-${i}`}
              className="w-14 h-16 text-center text-2xl font-bold border-2 border-indigo-200 rounded-xl focus:border-indigo-500 outline-none bg-white"
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
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

      <div className="bg-white rounded-xl p-4 border border-indigo-200 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount to Pay</span>
          <span className="text-2xl font-bold text-indigo-600">
            Rs. {total.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Pay directly to the worker ({booking.paymentMethod === "online" ? "via their account" : "cash"})
        </p>
      </div>

      <button
        onClick={() => onConfirm(otp, paymentMethod)}
        disabled={actionLoading || otp.length < 4}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
        Confirm Payment & Complete
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPLETED PANEL (unchanged)
───────────────────────────────────────── */
function CompletedPanel({ booking, navigate }) {
  const labor = booking.finalPrice?.laborCost || 0;

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <FaCheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-green-800 mb-1">Job Completed!</h3>
      <p className="text-green-700 text-sm mb-4">
        Payment confirmed. Thank you for using our service!
      </p>

      <div className="bg-white rounded-xl p-4 border border-green-200 text-left space-y-2 mb-4">
        <p className="font-semibold text-gray-700 mb-2">Payment Summary</p>
        <div className="flex justify-between font-bold">
          <span>Labor Cost Paid</span>
          <span className="text-green-600">Rs. {labor.toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-400">
          Payment via <span className="capitalize font-medium">{booking.paymentMethod}</span>
        </p>
      </div>

      {!booking.isReviewed ? (
        <button
          onClick={() => navigate(`/review/${booking._id}`)}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-semibold hover:shadow-md transition-all"
        >
          ⭐ Rate & Review Worker
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 py-3 bg-yellow-50 rounded-xl border border-yellow-200">
          <FaStar className="text-yellow-500" />
          <span className="text-yellow-700 font-medium text-sm">Review Submitted</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   CANCELLED PANEL  ★ UPDATED with penalty details
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
          <h3 className="font-semibold text-red-800">Booking Cancelled</h3>
          <p className="text-red-700 text-sm mt-0.5">
            Cancelled by: <span className="capitalize font-medium">{booking.cancelledBy}</span>
          </p>
          {booking.cancellationReason && (
            <p className="text-red-600 text-sm mt-1">Reason: {booking.cancellationReason}</p>
          )}

          {/* Penalty Details */}
          {penalty && penalty.amount > 0 && (
            <div className="mt-3 bg-red-100 rounded-xl p-3 space-y-1">
              <p className="text-red-800 text-sm font-semibold">
                Cancellation Penalty: Rs. {penalty.amount?.toLocaleString()}
              </p>
              <p className="text-red-700 text-xs">
                Paid by: <span className="capitalize font-medium">{penalty.paidBy}</span>
              </p>
              {penalty.reason && (
                <p className="text-red-600 text-xs">{penalty.reason}</p>
              )}
            </div>
          )}

          {penalty?.amount === 0 && (
            <div className="mt-3 bg-green-50 rounded-xl p-3 border border-green-200">
              <p className="text-green-700 text-sm">✅ No penalty applied</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ★ PRICE REVISION HISTORY (sidebar)
───────────────────────────────────────── */
function PriceRevisionHistory({ revisions }) {
  if (!revisions || revisions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <FaHistory className="text-gray-500 w-4 h-4" />
        Price Changes
      </h3>
      <div className="space-y-2">
        {revisions.map((rev, i) => (
          <div key={rev._id || i} className="text-sm p-2 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rs. {rev.totalAmount?.toLocaleString()}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                rev.status === "approved" ? "bg-green-100 text-green-700"
                  : rev.status === "rejected" ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {rev.status}
              </span>
            </div>
            {rev.reason && <p className="text-gray-400 text-xs mt-1">{rev.reason}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function BookingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchBooking();
  }, [id, user]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await getBookingDetails(id);
      setBooking(res.data.data.booking);
      setOffers(res.data.data.offers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  /* ── Handlers ── */
  const handleAcceptOffer = async (offerId) => {
    try {
      setActionLoading(true);
      await acceptOffer(offerId);
      showAlert("success", "Offer accepted!");
      fetchBooking();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRespondToInspection = async (action, counterFee, counterMessage) => {
    try {
      setActionLoading(true);
      await respondToInspection(id, { action, counterFee, counterMessage });
      const msg = action === "approve" ? "Inspection approved!" : action === "counter" ? "Counter offer sent!" : "Inspection rejected.";
      showAlert("success", msg);
      fetchBooking();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveFinalPrice = async () => {
    try {
      setActionLoading(true);
      const res = await approveFinalPrice(id);
      const otp = res.data.data?.startOTP;
      showAlert("success", `Price approved! Start OTP: ${otp}`);
      fetchBooking();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to approve price");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectFinalPrice = async () => {
    try {
      setActionLoading(true);
      await rejectFinalPrice(id, { reason: "Price not acceptable" });
      showAlert("success", "Booking cancelled.");
      fetchBooking();
    } catch (err) {
      showAlert("error", "Failed to reject price");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async (otp, paymentMethod) => {
    if (otp.length < 4) { showAlert("error", "Enter 4-digit OTP"); return; }
    try {
      setActionLoading(true);
      await confirmPayment(id, { otp, paymentMethod });
      showAlert("success", "Payment confirmed! Job completed.");
      fetchBooking();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Invalid OTP");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setActionLoading(true);
      await cancelBooking(id, { reason: cancelReason });
      setShowCancelModal(false);
      showAlert("success", "Booking cancelled.");
      fetchBooking();
    } catch (err) {
      showAlert("error", "Failed to cancel booking");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── ★ NEW: Price Revision handlers ── */
  const handleApprovePriceRevision = async (revisionId) => {
    try {
      setActionLoading(true);
      await approvePriceRevision(id, revisionId, { approve: true });
      showAlert("success", "Price revision approved!");
      fetchBooking();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPriceRevision = async (revisionId) => {
    try {
      setActionLoading(true);
      await approvePriceRevision(id, revisionId, { approve: false });
      showAlert("success", "Price revision rejected.");
      fetchBooking();
    } catch (err) {
      showAlert("error", "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── ★ NEW: Schedule approval ── */
  const handleApproveSchedule = async () => {
    try {
      setActionLoading(true);
      await approveScheduleUpdate(id);
      showAlert("success", "Schedule approved!");
      fetchBooking();
    } catch (err) {
      showAlert("error", "Failed to approve schedule");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Loading / Not Found ── */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading booking details...</p>
          </div>
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
            <FaClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Booking not found</h2>
            <button onClick={() => navigate("/my-bookings")} className="text-blue-600 hover:underline">
              Go back to My Bookings
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const meta = statusMeta[booking.status] || statusMeta.posted;
  const isCancelled = booking.status === "cancelled";
  const canCancel = !["work_in_progress", "completed", "cancelled"].includes(booking.status);
  const hasPendingRevisions = (booking.priceRevisions || []).some((r) => r.status === "pending");
  const hasScheduleUpdate = booking.schedule?.scheduledStartDate && !booking.schedule?.approvedByResident
    && ["price_approved", "work_in_progress"].includes(booking.status);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Alert */}
          {alertMsg && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
              alertMsg.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {alertMsg.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
              <p className="text-sm font-medium">{alertMsg.text}</p>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/my-bookings")}
              className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
            >
              <FaArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-mono">
                #{booking.bookingId || booking._id?.slice(-8).toUpperCase()}
              </p>
              <h1 className="text-xl font-bold text-gray-800">Booking Details</h1>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${meta.color}`}>
              <meta.icon className="w-3 h-3" />
              {meta.label}
            </span>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <ProgressBar currentStep={meta.step} cancelled={isCancelled} />
            <div className={`mt-4 p-3 rounded-xl text-sm flex items-start gap-2 ${meta.color}`}>
              <meta.icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{meta.message}</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left: Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Job Description Card */}
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
                <p className="text-gray-700 leading-relaxed mb-4">{booking.description}</p>
                {booking.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {booking.images.map((img, i) => (
                      <img
                        key={i}
                        src={`${import.meta.env.VITE_BASE_URL}/${img}`}
                        alt=""
                        className="w-24 h-24 rounded-xl object-cover border-2 border-gray-100"
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-start gap-2 text-gray-600 bg-gray-50 rounded-xl p-3">
                  <FaMapMarkerAlt className="mt-0.5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm">{booking.address}</span>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Posted: {new Date(booking.createdAt).toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric", year: "numeric",
                  })}
                </p>
              </div>

              {/* ── STATUS-BASED PANELS ── */}

              {/* Offers */}
              {["posted", "offers_received"].includes(booking.status) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FaBell className="text-purple-600" />
                      Worker Offers
                    </span>
                    <span className="text-sm font-normal text-gray-500">
                      {offers.length} offer{offers.length !== 1 ? "s" : ""}
                    </span>
                  </h3>
                  {offers.length === 0 ? (
                    <div className="text-center py-8">
                      <FaClock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No offers yet. Workers are reviewing your job.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {offers.map((offer) => (
                        <OfferCard
                          key={offer._id}
                          offer={offer}
                          onAccept={handleAcceptOffer}
                          actionLoading={actionLoading}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {booking.status === "inspection_requested" && (
                <InspectionRequestedPanel
                  booking={booking}
                  onRespond={handleRespondToInspection}
                  actionLoading={actionLoading}
                />
              )}

              {booking.status === "inspection_approved" && <InspectionApprovedPanel booking={booking} />}

              {booking.status === "awaiting_price_approval" && (
                <PriceApprovalPanel
                  booking={booking}
                  onApprove={handleApproveFinalPrice}
                  onReject={handleRejectFinalPrice}
                  actionLoading={actionLoading}
                />
              )}

              {booking.status === "price_approved" && <StartOTPPanel booking={booking} />}

              {/* ★ During work: price revision + schedule update */}
              {booking.status === "work_in_progress" && (
                <>
                  {hasPendingRevisions && (
                    <PriceRevisionPanel
                      booking={booking}
                      onApprove={handleApprovePriceRevision}
                      onReject={handleRejectPriceRevision}
                      actionLoading={actionLoading}
                    />
                  )}
                  {hasScheduleUpdate && (
                    <ScheduleUpdatePanel
                      booking={booking}
                      onApprove={handleApproveSchedule}
                      actionLoading={actionLoading}
                    />
                  )}
                  <ConfirmPaymentPanel
                    booking={booking}
                    onConfirm={handleConfirmPayment}
                    actionLoading={actionLoading}
                  />
                </>
              )}

              {booking.status === "completed" && <CompletedPanel booking={booking} navigate={navigate} />}
              {booking.status === "cancelled" && <CancelledPanel booking={booking} />}
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-4">

              {/* Worker Card */}
              {booking.selectedProvider ? (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaTools className="text-blue-600 w-4 h-4" />
                    Assigned Worker
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                      {booking.selectedProvider.profileImage ? (
                        <img
                          src={`${import.meta.env.VITE_BASE_URL}/${booking.selectedProvider.profileImage}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaUser className="w-7 h-7 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {booking.selectedProvider.userId?.name || "Worker"}
                      </p>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm">
                        <FaStar className="w-3 h-3" />
                        <span className="text-gray-600">
                          {booking.selectedProvider.rating?.toFixed(1) || "New"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {booking.selectedProvider.userId?.phone && (
                    <a
                      href={`tel:${booking.selectedProvider.userId.phone}`}
                      className="w-full py-2.5 bg-green-50 text-green-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-100 border border-green-200"
                    >
                      <FaPhone />
                      Call Worker
                    </a>
                  )}
                  <button
                    onClick={() => navigate(`/chat/${booking._id}`)}
                    className="w-full mt-3 py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    💬 Message Worker
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaUser className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No worker assigned yet</p>
                </div>
              )}

              {/* Booking Info Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Booking Info</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>
                  {booking.offerCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Offers</span>
                      <span className="font-medium text-gray-800">{booking.offerCount}</span>
                    </div>
                  )}
                  {booking.finalPrice?.totalAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Price</span>
                      <span className="font-bold text-gray-800">
                        Rs. {booking.finalPrice.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {booking.inspection?.fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Inspection Fee</span>
                      <span className="font-medium text-gray-800">Rs. {booking.inspection.fee}</span>
                    </div>
                  )}

                  {/* ★ Schedule info */}
                  {booking.schedule?.scheduledStartDate && (
                    <>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Scheduled</span>
                          <span className="text-gray-700 text-xs">
                            {new Date(booking.schedule.scheduledStartDate).toLocaleDateString("en-US", {
                              month: "short", day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      {booking.schedule.estimatedDuration?.value > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Duration</span>
                          <span className="text-gray-700">
                            {booking.schedule.estimatedDuration.value} {booking.schedule.estimatedDuration.unit}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500">Posted</span>
                    <span className="text-gray-700">
                      {new Date(booking.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Revision History */}
              <PriceRevisionHistory revisions={booking.priceRevisions} />

              {/* Cancel Button */}
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-3 border-2 border-red-200 text-red-600 rounded-2xl font-medium hover:bg-red-50 hover:border-red-400 transition-all text-sm"
                >
                  <FaTimesCircle className="inline mr-2" />
                  Cancel Booking
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
            <h3 className="text-lg font-bold text-gray-800 mb-1 text-center">Cancel Booking?</h3>
            <p className="text-gray-500 text-sm text-center mb-2">This action cannot be undone.</p>

            {/* ★ Show penalty warning */}
            {booking.inspection?.completedByProvider && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                <p className="text-amber-700 text-sm">
                  ⚠️ Inspection was completed. Agreed inspection fee of Rs. {booking.inspection?.agreedFee || 0} will apply.
                </p>
              </div>
            )}
            {booking.status === "work_in_progress" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                <p className="text-red-700 text-sm">
                  ⚠️ Work is in progress. Cancellation penalty will include inspection fee + days worked.
                </p>
              </div>
            )}

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 outline-none mb-4 resize-none text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading}
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