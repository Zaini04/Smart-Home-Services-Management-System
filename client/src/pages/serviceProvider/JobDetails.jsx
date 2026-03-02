import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaTools,
  FaClipboardList,
  FaKey,
  FaMoneyBillWave,
  FaSearch,
  FaExclamationTriangle,
  FaStar,
  FaShieldAlt,
  FaReceipt,
} from "react-icons/fa";
import {
  getJobDetails,
  verifyStartOTP,
  completeInspection,
  sendFinalPrice,
  startWork,
  completeWork,
} from "../../api/serviceProviderEndPoints";

/* ── Progress Steps ── */
const steps = [
  { step: 1, label: "Assigned" },
  { step: 2, label: "Inspection" },
  { step: 3, label: "Pricing" },
  { step: 4, label: "OTP" },
  { step: 5, label: "Working" },
  { step: 6, label: "Done" },
];

const statusMeta = {
  inspection_pending: {
    step: 1,
    label: "Inspection Pending",
    color: "bg-yellow-100 text-yellow-700",
    message: "Resident needs to approve inspection. Ask them to approve.",
  },
  inspection_scheduled: {
    step: 2,
    label: "Inspection Scheduled",
    color: "bg-orange-100 text-orange-700",
    message:
      "Inspection approved! Verify start OTP, then complete inspection and send final price.",
  },
  awaiting_price_approval: {
    step: 3,
    label: "Awaiting Price Approval",
    color: "bg-amber-100 text-amber-700",
    message: "Final price sent. Waiting for resident to approve.",
  },
  price_approved: {
    step: 4,
    label: "Price Approved",
    color: "bg-teal-100 text-teal-700",
    message: "Price approved by resident! Verify start OTP to begin work.",
  },
  work_in_progress: {
    step: 5,
    label: "Work In Progress",
    color: "bg-indigo-100 text-indigo-700",
    message:
      "Complete the work, then ask resident to confirm payment with complete OTP.",
  },
  completed: {
    step: 6,
    label: "Completed",
    color: "bg-green-100 text-green-700",
    message: "Job completed! Payment received.",
  },
  cancelled: {
    step: 0,
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    message: "This booking was cancelled.",
  },
};

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
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />
        {steps.map((s) => {
          const done = currentStep > s.step;
          const active = currentStep === s.step;
          return (
            <div key={s.step} className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
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

/* ── OTP Verify Panel ── */
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
            Ask the resident for their Start OTP and enter it below to begin.
          </p>
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
              if (val && i < 3) {
                document.getElementById(`sotp-${i + 1}`)?.focus();
              }
            }}
            className="w-14 h-16 text-center text-2xl font-bold border-2 border-teal-200 rounded-xl focus:border-teal-500 outline-none bg-white"
          />
        ))}
      </div>

      <button
        onClick={() => onVerify(otp)}
        disabled={loading || otp.length < 4}
        className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
        Verify OTP & Begin
      </button>
    </div>
  );
}

/* ── Inspection Form Panel ── */
function InspectionPanel({ onSubmit, loading }) {
  const [laborCost, setLaborCost] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [error, setError] = useState("");

  const total = (Number(laborCost) || 0) + (Number(materialCost) || 0);
  const commission = Math.round((Number(laborCost) || 0) * 0.15);
  const earning = total - commission;

  const handleSubmit = () => {
    if (!laborCost || Number(laborCost) <= 0) {
      setError("Please enter labor cost");
      return;
    }
    setError("");
    onSubmit({
      laborCost: Number(laborCost),
      materialCost: Number(materialCost) || 0,
      materialDescription,
    });
  };

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaSearch className="text-blue-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-800">
            Complete Inspection & Send Price
          </h3>
          <p className="text-blue-700 text-sm mt-0.5">
            Enter the final price after inspection.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-red-700 text-sm flex items-center gap-2">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Labor Cost (Rs.) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={laborCost}
            onChange={(e) => setLaborCost(e.target.value)}
            placeholder="e.g. 2000"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Cost (Rs.)
            <span className="text-gray-400 font-normal ml-1">(if any)</span>
          </label>
          <input
            type="number"
            value={materialCost}
            onChange={(e) => setMaterialCost(e.target.value)}
            placeholder="e.g. 500"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm"
          />
        </div>
        {materialCost && Number(materialCost) > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material Details
            </label>
            <input
              type="text"
              value={materialDescription}
              onChange={(e) => setMaterialDescription(e.target.value)}
              placeholder="e.g. Copper wire 2m, switch box"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm"
            />
          </div>
        )}
      </div>

      {/* Earnings Preview */}
      {total > 0 && (
        <div className="bg-white rounded-xl p-4 border border-blue-200 mb-4 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Labor</span>
            <span>Rs. {Number(laborCost || 0).toLocaleString()}</span>
          </div>
          {materialCost && Number(materialCost) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Materials</span>
              <span>Rs. {Number(materialCost).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Platform Fee (15%)</span>
            <span className="text-red-600">
              - Rs. {commission.toLocaleString()}
            </span>
          </div>
          <div className="border-t pt-1.5 flex justify-between font-bold">
            <span>Total to Resident</span>
            <span className="text-blue-700">Rs. {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-green-700">
            <span>Your Earning</span>
            <span>Rs. {earning.toLocaleString()}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <FaSpinner className="animate-spin" /> : <FaMoneyBillWave />}
        Send Price to Resident
      </button>
    </div>
  );
}

/* ── Send Price Panel (no inspection) ── */
function SendPricePanel({ onSubmit, loading }) {
  const [laborCost, setLaborCost] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [error, setError] = useState("");

  const total = (Number(laborCost) || 0) + (Number(materialCost) || 0);
  const commission = Math.round((Number(laborCost) || 0) * 0.15);
  const earning = total - commission;

  const handleSubmit = () => {
    if (!laborCost || Number(laborCost) <= 0) {
      setError("Please enter labor cost");
      return;
    }
    setError("");
    onSubmit({
      laborCost: Number(laborCost),
      materialCost: Number(materialCost) || 0,
      materialDescription,
    });
  };

  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaMoneyBillWave className="text-purple-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-purple-800">Send Final Price</h3>
          <p className="text-purple-700 text-sm mt-0.5">
            Send your final price to the resident for approval.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-red-700 text-sm flex items-center gap-2">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Labor Cost (Rs.) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={laborCost}
            onChange={(e) => setLaborCost(e.target.value)}
            placeholder="e.g. 2000"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Cost (Rs.)
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <input
            type="number"
            value={materialCost}
            onChange={(e) => setMaterialCost(e.target.value)}
            placeholder="e.g. 500"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-sm"
          />
        </div>
        {materialCost && Number(materialCost) > 0 && (
          <input
            type="text"
            value={materialDescription}
            onChange={(e) => setMaterialDescription(e.target.value)}
            placeholder="Material details (e.g. copper wire, switch)"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 outline-none text-sm"
          />
        )}
      </div>

      {total > 0 && (
        <div className="bg-white rounded-xl p-4 border border-purple-200 mb-4 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Platform Fee (15% of labor)</span>
            <span className="text-red-600">
              - Rs. {commission.toLocaleString()}
            </span>
          </div>
          <div className="border-t pt-1.5 flex justify-between font-bold text-purple-700">
            <span>Total (Resident pays)</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-green-700">
            <span>Your Earning</span>
            <span>Rs. {earning.toLocaleString()}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <FaSpinner className="animate-spin" /> : <FaMoneyBillWave />}
        Send Price
      </button>
    </div>
  );
}

/* ── Start Work Panel ── */
function StartWorkPanel({ onStart, loading }) {
  return (
    <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-5 text-center">
      <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <FaTools className="w-7 h-7 text-teal-600" />
      </div>
      <h3 className="font-semibold text-teal-800 mb-1">Ready to Start?</h3>
      <p className="text-teal-700 text-sm mb-4">
        OTP verified! Click below to officially start the work.
      </p>
      <button
        onClick={onStart}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <FaSpinner className="animate-spin" /> : <FaTools />}
        Start Work Now
      </button>
    </div>
  );
}

/* ── Complete Work Panel ── */
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
            Show the resident this Complete OTP. They'll enter it to confirm
            payment.
          </p>
        </div>
      </div>

      {/* Complete OTP Display */}
      {code && (
        <div className="bg-white rounded-xl p-4 border-2 border-indigo-200 text-center mb-4">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
            Complete OTP (Show to Resident)
          </p>
          <div className="flex items-center justify-center gap-2">
            {code.split("").map((d, i) => (
              <div
                key={i}
                className="w-14 h-16 bg-indigo-50 rounded-xl flex items-center justify-center text-3xl font-bold text-indigo-700 border-2 border-indigo-200"
              >
                {d}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Resident enters this to release payment
          </p>
        </div>
      )}

      <button
        onClick={onComplete}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
        Mark as Work Completed
      </button>
    </div>
  );
}

/* ── Completed Panel ── */
function CompletedPanel({ booking }) {
  const labor = booking.finalPrice?.laborCost || 0;
  const material = booking.finalPrice?.materialCost || 0;
  const total = booking.finalPrice?.totalAmount || 0;
  const commission = booking.commission?.amount || Math.round(labor * 0.15);
  const earning = booking.providerEarning || total - commission;

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <FaCheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-green-800 mb-1">
        Job Completed! 🎉
      </h3>
      <p className="text-green-700 text-sm mb-4">
        Payment has been confirmed and added to your wallet.
      </p>

      <div className="bg-white rounded-xl p-4 border border-green-200 text-left space-y-2">
        <p className="font-semibold text-gray-700 mb-2 text-sm">
          Payment Summary
        </p>
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
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Platform Fee</span>
          <span className="text-red-600">
            - Rs. {commission.toLocaleString()}
          </span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-green-700">
          <span>Your Earning</span>
          <span className="text-lg">Rs. {earning.toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-400">
          Added to your wallet •{" "}
          <span className="capitalize">{booking.paymentMethod}</span>
        </p>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export default function JobDetails() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchJob();
  }, [bookingId, user]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await getJobDetails(bookingId);
      setBooking(res.data.data);
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

  const handleVerifyOTP = async (otp) => {
    try {
      setActionLoading(true);
      await verifyStartOTP(bookingId, { otp });
      showAlert("success", "Start OTP verified! You can now proceed.");
      fetchJob();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Invalid OTP");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteInspection = async (data) => {
    try {
      setActionLoading(true);
      const res = await completeInspection(bookingId, data);
      showAlert(
        "success",
        `Price sent! Your earning: Rs. ${res.data.data.preview.yourEarning.toLocaleString()}`,
      );
      fetchJob();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to submit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendPrice = async (data) => {
    try {
      setActionLoading(true);
      const res = await sendFinalPrice(bookingId, data);
      showAlert(
        "success",
        `Price sent to resident! Your earning: Rs. ${res.data.data.preview.yourEarning.toLocaleString()}`,
      );
      fetchJob();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to send price");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartWork = async () => {
    try {
      setActionLoading(true);
      const res = await startWork(bookingId);
      showAlert(
        "success",
        `Work started! Complete OTP: ${res.data.data.completeOTP} — Show to resident when done.`,
      );
      fetchJob();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to start work");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteWork = async () => {
    try {
      setActionLoading(true);
      await completeWork(bookingId);
      showAlert(
        "success",
        "Work marked complete! Ask resident to confirm payment with the OTP.",
      );
      fetchJob();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed");
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
            <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading job details...</p>
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
            <FaClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Job not found
            </h2>
            <button
              onClick={() => navigate("/provider/my-jobs")}
              className="text-blue-600 hover:underline"
            >
              Back to My Jobs
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const meta = statusMeta[booking.status] || statusMeta.inspection_pending;
  const isCancelled = booking.status === "cancelled";
  const otpVerified = booking.otp?.start?.verified;
  const inspectionRequired = booking.inspection?.required;
  const inspectionDone = booking.inspection?.completedByProvider;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Alert */}
          {alertMsg && (
            <div
              className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${
                alertMsg.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {alertMsg.type === "success" ? (
                <FaCheckCircle className="flex-shrink-0 mt-0.5" />
              ) : (
                <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium">{alertMsg.text}</p>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/provider/my-jobs")}
              className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-mono">
                #{booking._id?.slice(-8).toUpperCase()}
              </p>
              <h1 className="text-xl font-bold text-gray-800">Job Details</h1>
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${meta.color}`}
            >
              {meta.label}
            </span>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <ProgressBar currentStep={meta.step} cancelled={isCancelled} />
            <div className={`mt-4 p-3 rounded-xl text-sm ${meta.color}`}>
              {meta.message}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Actions */}
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

                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {booking.description}
                </p>

                {/* Images */}
                {booking.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {booking.images.map((img, i) => (
                      <img
                        key={i}
                        src={`${import.meta.env.VITE_API_URL}/${img}`}
                        alt=""
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

              {/* ── ACTION PANELS ── */}

              {/* inspection_scheduled: Verify OTP first */}
              {booking.status === "inspection_scheduled" && !otpVerified && (
                <VerifyOTPPanel
                  onVerify={handleVerifyOTP}
                  loading={actionLoading}
                />
              )}

              {/* inspection_scheduled: After OTP verified, complete inspection */}
              {booking.status === "inspection_scheduled" &&
                otpVerified &&
                !inspectionDone && (
                  <InspectionPanel
                    onSubmit={handleCompleteInspection}
                    loading={actionLoading}
                  />
                )}

              {/* price_approved: Verify start OTP */}
              {booking.status === "price_approved" && !otpVerified && (
                <VerifyOTPPanel
                  onVerify={handleVerifyOTP}
                  loading={actionLoading}
                />
              )}

              {/* price_approved + OTP verified: Start Work */}
              {booking.status === "price_approved" && otpVerified && (
                <StartWorkPanel
                  onStart={handleStartWork}
                  loading={actionLoading}
                />
              )}

              {/* work_in_progress: Show complete OTP + complete work */}
              {booking.status === "work_in_progress" && (
                <CompleteWorkPanel
                  booking={booking}
                  onComplete={handleCompleteWork}
                  loading={actionLoading}
                />
              )}

              {/* awaiting_price_approval: waiting */}
              {booking.status === "awaiting_price_approval" && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-center">
                  <FaClock className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-pulse" />
                  <h3 className="font-semibold text-amber-800 mb-1">
                    Waiting for Resident Approval
                  </h3>
                  <p className="text-amber-700 text-sm">
                    Price sent. Resident will review and approve shortly.
                  </p>
                  {booking.finalPrice?.totalAmount > 0 && (
                    <div className="mt-3 bg-white rounded-xl p-3 border border-amber-200">
                      <p className="text-sm text-gray-600">
                        Quoted:{" "}
                        <span className="font-bold text-gray-800">
                          Rs. {booking.finalPrice.totalAmount.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* inspection_pending: waiting */}
              {booking.status === "inspection_pending" && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 text-center">
                  <FaClock className="w-10 h-10 text-yellow-500 mx-auto mb-3 animate-pulse" />
                  <h3 className="font-semibold text-yellow-800 mb-1">
                    Waiting for Resident Approval
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    Resident needs to approve the inspection request. Inspection
                    fee: Rs. {booking.inspection?.fee?.toLocaleString() || 0}
                  </p>
                </div>
              )}

              {/* completed */}
              {booking.status === "completed" && (
                <CompletedPanel booking={booking} />
              )}

              {/* cancelled */}
              {booking.status === "cancelled" && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaTimesCircle className="text-red-600 w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-800">
                        Job Cancelled
                      </h3>
                      <p className="text-red-700 text-sm mt-0.5">
                        Cancelled by:{" "}
                        <span className="capitalize font-medium">
                          {booking.cancelledBy}
                        </span>
                      </p>
                      {booking.cancellationReason && (
                        <p className="text-red-600 text-sm mt-1">
                          Reason: {booking.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Resident Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                  <FaUser className="text-blue-600 w-4 h-4" />
                  Resident
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                    <FaUser className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {booking.resident?.name || "Resident"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.resident?.phone || "No phone"}
                    </p>
                  </div>
                </div>
                {booking.resident?.phone && (
                  <a
                    href={`tel:${booking.resident.phone}`}
                    className="w-full py-2.5 bg-green-50 text-green-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-100 transition-colors border border-green-200 text-sm"
                  >
                    <FaPhone className="w-3.5 h-3.5" />
                    Call Resident
                  </a>
                )}

                {booking.resident && (
                  <button
                    onClick={() => navigate(`/provider/chat/${booking._id}`)}
                    className="w-full mt-3 py-2.5 bg-blue-600 text-white rounded-xl
               font-medium flex items-center justify-center gap-2
               hover:bg-blue-700 transition-colors"
                  >
                    💬 Message Resident
                  </button>
                )}
              </div>

              {/* Job Summary Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                  Job Summary
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

                  {booking.inspection?.required && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Inspection Fee</span>
                      <span className="font-medium">
                        Rs. {booking.inspection.fee || 0}
                      </span>
                    </div>
                  )}

                  {booking.finalPrice?.laborCost > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Labor Cost</span>
                        <span className="font-medium">
                          Rs. {booking.finalPrice.laborCost.toLocaleString()}
                        </span>
                      </div>
                      {booking.finalPrice.materialCost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Materials</span>
                          <span className="font-medium">
                            Rs.{" "}
                            {booking.finalPrice.materialCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Platform Fee</span>
                        <span className="text-red-600 font-medium">
                          - Rs.{" "}
                          {Math.round(
                            booking.finalPrice.laborCost * 0.15,
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-green-700">
                        <span>Your Earning</span>
                        <span>
                          Rs.{" "}
                          {(
                            booking.finalPrice.totalAmount -
                            Math.round(booking.finalPrice.laborCost * 0.15)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between pt-1 border-t">
                    <span className="text-gray-500">Posted</span>
                    <span className="text-gray-600">
                      {new Date(booking.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* OTP Status */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                  OTP Status
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Start OTP</span>
                    {booking.otp?.start?.verified ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <FaCheckCircle /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <FaClock /> Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Complete OTP</span>
                    {booking.otp?.complete?.verified ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <FaCheckCircle /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <FaClock /> Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
