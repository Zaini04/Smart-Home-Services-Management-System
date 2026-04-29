// jobDetails/JobDetails.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaArrowLeft, FaUser, FaMapMarkerAlt, FaClock, FaSpinner, FaClipboardList, FaCheckCircle, FaExclamationTriangle, FaWallet, FaLocationArrow, FaBan, FaCalendarAlt } from "react-icons/fa";
import { buildMediaUrl } from "../../utils/url";
import { useJobDetails } from "../../components/serviceProvider/jobDetails/useJobDetails";
import { statusMeta, formatSchedule } from "../../components/serviceProvider/jobDetails/panels/jobConstants";
import ProgressBar from "../../components/serviceProvider/jobDetails/panels/ProgressBar";
import VerifyOTPPanel from "../../components/serviceProvider/jobDetails/panels/VerifyOTPPanel";
import InspectionAndPricePanel from "../../components/serviceProvider/jobDetails/panels/InspectionAndPricePanel";
import RequestInspectionPanel from "../../components/serviceProvider/jobDetails/panels/RequestInspectionPanel";
import PriceRevisionPanel from "../../components/serviceProvider/jobDetails/panels/PriceRevisionPanel";
import UpdateSchedulePanel from "../../components/serviceProvider/jobDetails/panels/UpdateSchedulePanel";
import StartWorkPanel from "../../components/serviceProvider/jobDetails/panels/StartWorkPanel";
import CompleteWorkPanel from "../../components/serviceProvider/jobDetails/panels/CompleteWorkPanel";
import CompletedPanel from "../../components/serviceProvider/jobDetails/panels/CompletedPanel";
import CancelledPanel from "../../components/serviceProvider/jobDetails/panels/CancelledPanel";
import RevisionHistory from "../../components/serviceProvider/jobDetails/panels/RevisionHistory";
import ConflictModal from "../../components/serviceProvider/jobDetails/panels/ConflictModal";
import UpdatePendingSchedulePanel from "../../components/serviceProvider/jobDetails/panels/UpdatePendingSchedulePanel";

export default function JobDetails() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const {
    loading, actionLoading, booking, walletBalance, alertMsg, conflictModal, setConflictModal,
    handleVerifyOTP, handleCompleteInspection, handleSendPrice, handleUpdatePendingSchedule,
    handleStartWork, handleCompleteWork, handleRequestInspection, handleUpdatePrice,
    handleCancelJob, handleRespondToCounter, handleUpdateSchedule
  } = useJobDetails(bookingId, user);

  if (!user) { navigate("/login"); return null; }
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><FaSpinner className="w-12 h-12 text-blue-500 animate-spin" /></div>;
  if (!booking) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><FaClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-3" /><h2 className="text-xl font-semibold text-gray-700 mb-2">Job not found</h2></div></div>;

  const meta = statusMeta[booking.status] || statusMeta.provider_selected;
  const isCancelled = booking.status === "cancelled";
  const otpVerified = booking.otp?.start?.verified;
  const schedule = formatSchedule(booking.schedule);
  const canCancel = !["completed", "cancelled"].includes(booking.status);
  const canRequestInspection = booking.status === "provider_selected";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {alertMsg && (
          <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${alertMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
            {alertMsg.type === "success" ? <FaCheckCircle className="mt-0.5" /> : <FaExclamationTriangle className="mt-0.5" />}
            <p className="text-sm font-medium">{alertMsg.text}</p>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/provider/my-jobs")} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"><FaArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-mono">#{booking.bookingId || booking._id?.slice(-8).toUpperCase()}</p>
            <h1 className="text-xl font-bold text-gray-800">Job Details</h1>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${meta.color}`}>{meta.label}</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <ProgressBar currentStep={meta.step} cancelled={isCancelled} />
          <div className={`mt-4 p-3 rounded-xl text-sm ${meta.color}`}>{meta.message}</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaClipboardList className="text-blue-600" /> Job Description</h3>
              {booking.category && <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-3">{booking.category.name}</span>}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">{booking.description}</p>
              {booking.images?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {booking.images.map((img, i) => <img key={i} src={buildMediaUrl(img)} alt="" className="w-24 h-24 rounded-xl object-cover border border-gray-200" />)}
                </div>
              )}
              <div className="flex items-start justify-between gap-2 text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-start gap-2 flex-1">
                  <FaMapMarkerAlt className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{booking.address}</span>
                </div>
                {booking.location?.lat && booking.location?.lng && (
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${booking.location.lat},${booking.location.lng}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
                    <FaLocationArrow /> Get Directions
                  </a>
                )}
              </div>
            </div>

            {booking.status === "provider_selected" && <InspectionAndPricePanel isInspection={false} onSubmit={handleSendPrice} loading={actionLoading} walletBalance={walletBalance} />}
            {booking.status === "inspection_requested" && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 text-center">
                <FaClock className="w-10 h-10 text-yellow-500 mx-auto mb-3 animate-pulse" />
                <h3 className="font-semibold text-yellow-800 mb-1">Waiting for Resident</h3>
                <p className="text-yellow-700 text-sm">
                  {booking.inspection?.status === "counter_offered" ? `Resident countered with Rs. ${booking.inspection.counterFee}. Accept or re-propose.` : `Inspection fee: Rs. ${booking.inspection?.fee?.toLocaleString() || 0}. Waiting for approval.`}
                </p>
                {booking.inspection?.scheduledDate && (
                  <div className="mt-3 bg-white/60 p-2 rounded-lg inline-block text-yellow-800 text-xs font-medium">
                    Scheduled for: {new Date(booking.inspection.scheduledDate).toLocaleDateString()} at {booking.inspection.scheduledTime}
                  </div>
                )}
                {booking.inspection?.status === "counter_offered" && (
                  <div className="mt-3 flex gap-2 justify-center">
                    <button onClick={() => handleRespondToCounter("accept")} disabled={actionLoading} className="px-4 py-2 bg-green-500 text-white rounded-xl font-medium text-sm hover:bg-green-600 disabled:opacity-60">Accept Rs. {booking.inspection.counterFee}</button>
                    <button onClick={() => { const newFee = prompt("Enter your new proposed fee:"); if (newFee) handleRespondToCounter("re_propose", Number(newFee)); }} disabled={actionLoading} className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 disabled:opacity-60">Re-propose</button>
                  </div>
                )}
              </div>
            )}
            {booking.status === "inspection_approved" && <InspectionAndPricePanel isInspection={true} onSubmit={handleCompleteInspection} loading={actionLoading} walletBalance={walletBalance} />}
            {booking.status === "price_approved" && !otpVerified && (
              <>
                <VerifyOTPPanel onVerify={handleVerifyOTP} loading={actionLoading} />
                <UpdatePendingSchedulePanel booking={booking} onSubmit={handleUpdatePendingSchedule} loading={actionLoading} />
              </>
            )}
            {booking.status === "price_approved" && otpVerified && <StartWorkPanel onStart={handleStartWork} loading={actionLoading} />}
            {booking.status === "work_in_progress" && (
              <>
                <CompleteWorkPanel booking={booking} onComplete={handleCompleteWork} loading={actionLoading} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PriceRevisionPanel booking={booking} onSubmit={handleUpdatePrice} loading={actionLoading} walletBalance={walletBalance} />
                  <UpdateSchedulePanel booking={booking} onSubmit={handleUpdateSchedule} loading={actionLoading} />
                </div>
              </>
            )}
            {booking.status === "awaiting_price_approval" && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-center">
                <FaClock className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-pulse" />
                <h3 className="font-semibold text-amber-800 mb-1">Waiting for Resident Approval</h3>
                <p className="text-amber-700 text-sm">Price & schedule sent. Resident will review shortly.</p>
              </div>
            )}
            {canRequestInspection && <RequestInspectionPanel onRequest={handleRequestInspection} loading={actionLoading} />}
            {booking.status === "completed" && <CompletedPanel booking={booking} />}
            {booking.status === "cancelled" && <CancelledPanel booking={booking} />}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm"><FaUser className="text-blue-600 w-4 h-4" /> Resident</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                  <FaUser className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{booking.resident?.full_name || "Resident"}</p>
                  <p className="text-xs text-gray-500">{booking.resident?.phone || "No phone"}</p>
                </div>
              </div>
              <button onClick={() => navigate(`/provider/chat/${booking._id}`)} className="w-full mt-3 py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700">💬 Message Resident</button>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Job Summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>{meta.label}</span></div>
                {booking.inspection?.required && <div className="flex justify-between"><span className="text-gray-500">Inspection Fee</span><span className="font-medium">Rs. {booking.inspection.fee || 0}</span></div>}
                {booking.inspection?.scheduledDate && !booking.inspection?.completedByProvider && (
                  <div className="border-t pt-2 mt-2">
                    <span className="text-xs text-amber-600 font-medium block mb-1">Inspection Visit</span>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="text-gray-700">{new Date(booking.inspection.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {booking.inspection.scheduledTime}</span>
                    </div>
                  </div>
                )}
                {booking.finalPrice?.laborCost > 0 && (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500">Labor Cost</span><span className="font-medium">Rs. {booking.finalPrice.laborCost.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Commission</span><span className="text-red-600 font-medium">- Rs. {(booking.commission?.amount || 0).toLocaleString()}</span></div>
                    <div className="border-t pt-2 flex justify-between font-bold text-green-700">
                      <span>Your Earning</span>
                      <span>Rs. {((booking.finalPrice.totalAmount || 0) - (booking.commission?.amount || 0)).toLocaleString()}</span>
                    </div>
                  </>
                )}
                {schedule && (
                  <div className="border-t pt-2 mt-2 space-y-1.5">
                    <div className="flex items-center gap-2"><FaCalendarAlt className="text-blue-600 w-3 h-3" /><span className="text-gray-500 text-xs">Work Schedule</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Start</span><span className="text-gray-700 text-xs">{schedule.dateStr} {schedule.timeStr}</span></div>
                    {schedule.durStr && <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="text-gray-700">{schedule.durStr}</span></div>}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2"><FaWallet className="text-green-600 w-4 h-4" /> Wallet</h3>
              <p className="text-lg font-bold text-green-600">Rs. {walletBalance.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Available balance</p>
            </div>

            <RevisionHistory revisions={booking.priceRevisions} />

            {canCancel && (
              <button onClick={() => setShowCancelModal(true)} className="w-full py-3 border-2 border-red-200 text-red-600 rounded-2xl font-medium hover:bg-red-50 transition-all text-sm flex items-center justify-center gap-2">
                <FaBan className="w-4 h-4" /> Cancel Job
              </button>
            )}
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Cancel This Job?</h3>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation (optional)" rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 outline-none mb-4 resize-none text-sm" />
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">Keep Job</button>
              <button onClick={() => handleCancelJob(cancelReason, () => setShowCancelModal(false))} disabled={actionLoading} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 flex items-center justify-center gap-2">
                {actionLoading ? <FaSpinner className="animate-spin" /> : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConflictModal conflict={conflictModal} isExtending={conflictModal?.isExtending || false} onClose={() => setConflictModal(null)} onMessage={(conflictBookingId) => { setConflictModal(null); navigate(`/provider/job/${conflictBookingId}`); }} onPickAnother={() => { setConflictModal(null); alertMsg("info", "Reduce the extension below."); }} />
    </div>
  );
}

