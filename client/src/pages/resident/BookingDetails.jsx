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
  FaChevronRight,
  FaShieldAlt,
} from "react-icons/fa";
import {
  getBookingDetails,
  acceptOffer,
  approveInspection,
  approveFinalPrice,
  rejectFinalPrice,
  confirmPayment,
  cancelBooking,
} from "../../api/residentsEndpoints";

/* ─────────────────────────────────────────
   STATUS META
───────────────────────────────────────── */
const statusMeta = {
  posted: {
    label: "Waiting for Offers",
    color: "bg-blue-100 text-blue-700",
    barColor: "bg-blue-500",
    step: 1,
    icon: FaClock,
    message: "Your job is live! Workers are reviewing it and will send offers soon.",
  },
  offers_received: {
    label: "Offers Received",
    color: "bg-purple-100 text-purple-700",
    barColor: "bg-purple-500",
    step: 2,
    icon: FaBell,
    message: "You have received offers! Review them below and accept the best one.",
  },
  inspection_pending: {
    label: "Inspection Pending",
    color: "bg-yellow-100 text-yellow-700",
    barColor: "bg-yellow-500",
    step: 3,
    icon: FaSearch,
    message: "Worker needs to inspect the problem before finalizing the price. Please approve.",
  },
  inspection_scheduled: {
    label: "Inspection Scheduled",
    color: "bg-orange-100 text-orange-700",
    barColor: "bg-orange-500",
    step: 3,
    icon: FaClock,
    message: "Inspection approved! Worker will visit to assess the problem.",
  },
  awaiting_price_approval: {
    label: "Price Approval Needed",
    color: "bg-amber-100 text-amber-700",
    barColor: "bg-amber-500",
    step: 4,
    icon: FaMoneyBillWave,
    message: "Worker has sent the final price. Please review and approve to proceed.",
  },
  price_approved: {
    label: "Price Approved",
    color: "bg-teal-100 text-teal-700",
    barColor: "bg-teal-500",
    step: 5,
    icon: FaKey,
    message: "Share the Start OTP with the worker when they arrive to begin work.",
  },
  work_in_progress: {
    label: "Work In Progress",
    color: "bg-indigo-100 text-indigo-700",
    barColor: "bg-indigo-500",
    step: 6,
    icon: FaTools,
    message: "Worker is currently working. Once done, enter the Complete OTP to confirm payment.",
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700",
    barColor: "bg-green-500",
    step: 7,
    icon: FaCheckCircle,
    message: "Job completed successfully! Please leave a review for the worker.",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    barColor: "bg-red-500",
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
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        {/* Progress line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-blue-500 z-0 transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (lifecycleSteps.length - 1)) * 100}%`,
          }}
        />

        {lifecycleSteps.map((s) => {
          const done = currentStep > s.step;
          const active = currentStep === s.step;
          return (
            <div key={s.step} className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  done
                    ? "bg-blue-500 border-blue-500"
                    : active
                    ? "bg-white border-blue-500 shadow-md shadow-blue-200"
                    : "bg-white border-gray-300"
                }`}
              >
                {done ? (
                  <FaCheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <span
                    className={`text-xs font-bold ${
                      active ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {s.step}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  active
                    ? "text-blue-600"
                    : done
                    ? "text-gray-600"
                    : "text-gray-400"
                }`}
              >
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
   OFFER CARD
───────────────────────────────────────── */
function OfferCard({ offer, onAccept, actionLoading }) {
  return (
    <div className="border-2 border-gray-200 hover:border-blue-300 rounded-2xl p-4 transition-all">
      <div className="flex gap-4">
        {/* Avatar */}
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
          {/* Name + Price */}
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

          {/* Skills */}
          {offer.provider?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {offer.provider.skills.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Message */}
          {offer.message && (
            <p className="text-gray-600 text-sm bg-gray-50 rounded-xl p-3 mb-3 italic">
              "{offer.message}"
            </p>
          )}

          {/* Inspection Warning */}
          {offer.inspectionRequired && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-3 text-sm">
              <FaExclamationTriangle className="flex-shrink-0" />
              <span>
                Inspection required — Fee: Rs.{" "}
                {offer.proposedInspectionFee || 0}
              </span>
            </div>
          )}

          {/* Accept Button */}
          <button
            onClick={() => onAccept(offer._id)}
            disabled={actionLoading}
            className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {actionLoading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaCheckCircle />
            )}
            Accept This Offer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ACTION PANELS
───────────────────────────────────────── */

// Panel: Inspection Pending
function InspectionPendingPanel({ booking, onApprove, actionLoading }) {
  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaSearch className="text-amber-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-800">Inspection Required</h3>
          <p className="text-amber-700 text-sm mt-0.5">
            The worker needs to visit and inspect the issue before providing the
            final price.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4 border border-amber-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Inspection Fee</span>
          <span className="font-bold text-gray-800 text-lg">
            Rs. {booking.inspection?.fee?.toLocaleString() || 0}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          This fee applies even if you cancel after inspection
        </p>
      </div>

      <button
        onClick={onApprove}
        disabled={actionLoading}
        className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
        Approve Inspection
      </button>
    </div>
  );
}

// Panel: Inspection Scheduled
function InspectionScheduledPanel() {
  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaClock className="text-orange-600 w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-semibold text-orange-800">Inspection Scheduled</h3>
          <p className="text-orange-700 text-sm mt-0.5">
            Worker will visit soon. After inspection, they will send the final
            price for your approval.
          </p>
        </div>
      </div>
    </div>
  );
}

// Panel: Price Approval
function PriceApprovalPanel({ booking, onApprove, onReject, actionLoading }) {
  const labor = booking.finalPrice?.laborCost || 0;
  const material = booking.finalPrice?.materialCost || 0;
  const total = booking.finalPrice?.totalAmount || labor + material;
  const commission = Math.round(labor * 0.15);

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaMoneyBillWave className="text-blue-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-800">Final Price from Worker</h3>
          <p className="text-blue-700 text-sm mt-0.5">
            Review the price breakdown and approve to proceed.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4 border border-blue-200 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Labor Cost</span>
          <span className="font-medium text-gray-800">
            Rs. {labor.toLocaleString()}
          </span>
        </div>
        {material > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Material Cost</span>
            <span className="font-medium text-gray-800">
              Rs. {material.toLocaleString()}
            </span>
          </div>
        )}
        {booking.finalPrice?.materialDescription && (
          <p className="text-xs text-gray-400 pl-0">
            📦 {booking.finalPrice.materialDescription}
          </p>
        )}
        <div className="border-t pt-2 flex justify-between">
          <span className="font-bold text-gray-800">Total Amount</span>
          <span className="font-bold text-xl text-blue-600">
            Rs. {total.toLocaleString()}
          </span>
        </div>
      </div>

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
          {actionLoading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaCheckCircle />
          )}
          Approve Price
        </button>
      </div>
    </div>
  );
}

// Panel: Start OTP
function StartOTPPanel({ booking }) {
  const [copied, setCopied] = useState(false);
  const code = booking.otp?.start?.code || "----";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaKey className="text-teal-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-teal-800">Start OTP</h3>
          <p className="text-teal-700 text-sm mt-0.5">
            Share this OTP with the worker when they arrive. They need it to
            start the job.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border-2 border-teal-200 text-center mb-3">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
          Start OTP
        </p>
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

// Panel: Confirm Payment
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
            Work is in progress. Once done, enter the complete OTP from the
            worker to confirm and pay.
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
                // Auto-focus next
                if (val && i < 3) {
                  const next = document.getElementById(`otp-${i + 1}`);
                  next?.focus();
                }
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

      {/* Amount */}
      <div className="bg-white rounded-xl p-4 border border-indigo-200 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount to Pay</span>
          <span className="text-2xl font-bold text-indigo-600">
            Rs. {total.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={() => onConfirm(otp, paymentMethod)}
        disabled={actionLoading || otp.length < 4}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {actionLoading ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaCheckCircle />
        )}
        Confirm Payment & Complete
      </button>
    </div>
  );
}

// Panel: Completed
function CompletedPanel({ booking, navigate }) {
  const total = booking.finalPrice?.totalAmount || 0;
  const labor = booking.finalPrice?.laborCost || 0;
  const material = booking.finalPrice?.materialCost || 0;
  const commission = booking.commission?.amount || 0;

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <FaCheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-green-800 mb-1">Job Completed!</h3>
      <p className="text-green-700 text-sm mb-4">
        Payment confirmed. Thank you for using our service!
      </p>

      {/* Payment Summary */}
      <div className="bg-white rounded-xl p-4 border border-green-200 text-left space-y-2 mb-4">
        <p className="font-semibold text-gray-700 mb-2">Payment Summary</p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Labor</span>
          <span>Rs. {labor.toLocaleString()}</span>
        </div>
        {material > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Materials</span>
            <span>Rs. {material.toLocaleString()}</span>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between font-bold">
          <span>Total Paid</span>
          <span className="text-green-600">Rs. {total.toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-400">
          Payment via{" "}
          <span className="capitalize font-medium">{booking.paymentMethod}</span>
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
          <span className="text-yellow-700 font-medium text-sm">
            Review Submitted
          </span>
        </div>
      )}
    </div>
  );
}

// Panel: Cancelled
function CancelledPanel({ booking }) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaTimesCircle className="text-red-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-red-800">Booking Cancelled</h3>
          <p className="text-red-700 text-sm mt-0.5">
            Cancelled by:{" "}
            <span className="capitalize font-medium">{booking.cancelledBy}</span>
          </p>
          {booking.cancellationReason && (
            <p className="text-red-600 text-sm mt-1">
              Reason: {booking.cancellationReason}
            </p>
          )}
          {booking.cancellationFee > 0 && (
            <div className="mt-2 bg-red-100 rounded-lg px-3 py-2">
              <p className="text-red-700 text-sm font-medium">
                Cancellation Fee: Rs. {booking.cancellationFee}
              </p>
            </div>
          )}
        </div>
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
  const [alertMsg, setAlertMsg] = useState(null); // { type, text }

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
    setTimeout(() => setAlertMsg(null), 4000);
  };

  /* ── Handlers ── */
  const handleAcceptOffer = async (offerId) => {
    try {
      setActionLoading(true);
      await acceptOffer(offerId);
      showAlert("success", "Offer accepted successfully!");
      fetchBooking();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to accept offer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveInspection = async () => {
    try {
      setActionLoading(true);
      await approveInspection(id);
      showAlert("success", "Inspection approved! Worker will visit soon.");
      fetchBooking();
    } catch (err) {
      showAlert("error", "Failed to approve inspection");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveFinalPrice = async () => {
    try {
      setActionLoading(true);
      const res = await approveFinalPrice(id);
      showAlert(
        "success",
        `Price approved! Start OTP: ${res.data.data.startOTP} — Share with worker.`
      );
      fetchBooking();
    } catch (err) {
      showAlert("error", "Failed to approve price");
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
    if (otp.length < 4) {
      showAlert("error", "Please enter the 4-digit OTP");
      return;
    }
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

  /* ── Loading ── */
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
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Booking not found
            </h2>
            <button
              onClick={() => navigate("/my-bookings")}
              className="text-blue-600 hover:underline"
            >
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
  const canCancel = !["work_in_progress", "completed", "cancelled"].includes(
    booking.status
  );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* ── Alert Banner ── */}
          {alertMsg && (
            <div
              className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
                alertMsg.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {alertMsg.type === "success" ? (
                <FaCheckCircle className="flex-shrink-0" />
              ) : (
                <FaTimesCircle className="flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{alertMsg.text}</p>
            </div>
          )}

          {/* ── Header ── */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/my-bookings")}
              className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-mono">
                #{booking.bookingId || booking._id?.slice(-8).toUpperCase()}
              </p>
              <h1 className="text-xl font-bold text-gray-800">
                Booking Details
              </h1>
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${meta.color}`}
            >
              <meta.icon className="w-3 h-3" />
              {meta.label}
            </span>
          </div>

          {/* ── Progress Bar ── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <ProgressBar currentStep={meta.step} cancelled={isCancelled} />

            {/* Status message */}
            <div
              className={`mt-4 p-3 rounded-xl text-sm flex items-start gap-2 ${meta.color}`}
            >
              <meta.icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{meta.message}</p>
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left: Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Job Description Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaClipboardList className="text-blue-600" />
                  Job Description
                </h3>

                {/* Category */}
                {booking.category && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-3">
                    {booking.category.name}
                  </span>
                )}

                <p className="text-gray-700 leading-relaxed mb-4">
                  {booking.description}
                </p>

                {/* Images */}
                {booking.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {booking.images.map((img, i) => (
                      <img
                        key={i}
                        src={`${import.meta.env.VITE_BASE_URL}/${img}`}
                        alt={`Problem ${i + 1}`}
                        className="w-24 h-24 rounded-xl object-cover border-2 border-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    ))}
                  </div>
                )}

                {/* Address */}
                <div className="flex items-start gap-2 text-gray-600 bg-gray-50 rounded-xl p-3">
                  <FaMapMarkerAlt className="mt-0.5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm">{booking.address}</span>
                </div>

                {/* Date */}
                <p className="text-xs text-gray-400 mt-3">
                  Posted:{" "}
                  {new Date(booking.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* ── ACTION PANELS based on status ── */}

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
                      <p className="text-gray-500 text-sm">
                        No offers yet. Workers are reviewing your job.
                      </p>
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

              {/* Inspection Pending */}
              {booking.status === "inspection_pending" && (
                <InspectionPendingPanel
                  booking={booking}
                  onApprove={handleApproveInspection}
                  actionLoading={actionLoading}
                />
              )}

              {/* Inspection Scheduled */}
              {booking.status === "inspection_scheduled" && (
                <InspectionScheduledPanel />
              )}

              {/* Price Approval */}
              {booking.status === "awaiting_price_approval" && (
                <PriceApprovalPanel
                  booking={booking}
                  onApprove={handleApproveFinalPrice}
                  onReject={handleRejectFinalPrice}
                  actionLoading={actionLoading}
                />
              )}

              {/* Start OTP */}
              {booking.status === "price_approved" && (
                <StartOTPPanel booking={booking} />
              )}

              {/* Confirm Payment */}
              {booking.status === "work_in_progress" && (
                <ConfirmPaymentPanel
                  booking={booking}
                  onConfirm={handleConfirmPayment}
                  actionLoading={actionLoading}
                />
              )}

              {/* Completed */}
              {booking.status === "completed" && (
                <CompletedPanel booking={booking} navigate={navigate} />
              )}

              {/* Cancelled */}
              {booking.status === "cancelled" && (
                <CancelledPanel booking={booking} />
              )}
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
                      <p className="text-xs text-gray-400">
                        {booking.selectedProvider.completedJobs || 0} jobs completed
                      </p>
                    </div>
                  </div>

                  {/* Call Button */}
                  {booking.selectedProvider.userId?.phone && (
                    <a
                      href={`tel:${booking.selectedProvider.userId.phone}`}
                      className="w-full py-2.5 bg-green-50 text-green-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-100 transition-colors border border-green-200"
                    >
                      <FaPhone />
                      Call Worker
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaUser className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    No worker assigned yet
                  </p>
                </div>
              )}

              {/* Booking Info Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Booking Info
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  {booking.offerCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Offers</span>
                      <span className="font-medium text-gray-800">
                        {booking.offerCount}
                      </span>
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
                      <span className="font-medium text-gray-800">
                        Rs. {booking.inspection.fee}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Posted</span>
                    <span className="text-gray-700">
                      {new Date(booking.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

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

      {/* ── Cancel Modal ── */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1 text-center">
              Cancel Booking?
            </h3>
            <p className="text-gray-500 text-sm text-center mb-4">
              This action cannot be undone.
              {booking.selectedProvider &&
                " A small cancellation fee may apply."}
            </p>
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
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {actionLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}