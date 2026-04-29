// pages/resident/bookingDetails/BookingDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
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
  FaBell,
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
  respondToReschedule,
} from "../../api/residentsEndpoints";
import { buildMediaUrl, getApiBaseUrl } from "../../utils/url";
import { statusMeta } from "../../components/resident/bookingDetails/panels/bookingConstants";

// Panels
import BookingProgressBar     from "../../components/resident/bookingDetails/panels/BookingProgressBar";
import OfferCard              from "../../components/resident/bookingDetails/panels/OfferCard";
import InspectionRequestedPanel from "../../components/resident/bookingDetails/panels/InspectionRequestedPanel";
import InspectionApprovedPanel  from "../../components/resident/bookingDetails/panels/InspectionApprovedPanel";
import PriceApprovalPanel     from "../../components/resident/bookingDetails/panels/PriceApprovalPanel";
import PriceRevisionPanel     from "../../components/resident/bookingDetails/panels/PriceRevisionPanel";
import ScheduleUpdatePanel    from "../../components/resident/bookingDetails/panels/ScheduleUpdatePanel";
import StartOTPPanel          from "../../components/resident/bookingDetails/panels/StartOTPPanel";
import ConfirmPaymentPanel    from "../../components/resident/bookingDetails/panels/ConfirmPaymentPanel";
import CompletedPanel         from "../../components/resident/bookingDetails/panels/CompletedPanel";
import CancelledPanel         from "../../components/resident/bookingDetails/panels/CancelledPanel";
import RescheduleRequestPanel from "../../components/resident/bookingDetails/panels/RescheduleRequestPanel";
import PriceRevisionHistory   from "../../components/resident/bookingDetails/panels/PriceRevisionHistory";
import CancelBookingModal     from "../../components/resident/bookingDetails/panels/CancelBookingModal";

export default function BookingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const apiBaseUrl = getApiBaseUrl();

  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);

  const { data: fetchResult, isLoading: loading } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const res = await getBookingDetails(id);
      return res.data.data;
    },
    enabled: !!user && !!id,
  });

  const booking = fetchResult?.booking || null;
  const offers  = fetchResult?.offers  || [];

  // Live socket refresh
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("accessToken");
    const socket = io(apiBaseUrl, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socket.on("data_updated", () => queryClient.invalidateQueries(["booking", id]));
    return () => socket.disconnect();
  }, [queryClient, id, user, apiBaseUrl]);

  if (!user) { navigate("/login"); return null; }

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 5000);
  };
  const refreshData = () => queryClient.invalidateQueries(["booking", id]);

  /* ── Handlers ── */
  const handleAcceptOffer = async (offerId) => {
    try { setActionLoading(true); await acceptOffer(offerId); showAlert("success", "Offer accepted!"); refreshData(); }
    catch (err) { showAlert("error", err.response?.data?.message || "Failed"); }
    finally { setActionLoading(false); }
  };

  const handleRespondToInspection = async (action, counterFee, counterMessage) => {
    try {
      setActionLoading(true);
      await respondToInspection(id, { action, counterFee, counterMessage });
      showAlert("success", action === "approve" ? "Inspection approved!" : action === "counter" ? "Counter offer sent!" : "Inspection rejected.");
      refreshData();
    } catch (err) { showAlert("error", err.response?.data?.message || "Failed"); }
    finally { setActionLoading(false); }
  };

  const handleApproveFinalPrice = async () => {
    try { setActionLoading(true); const res = await approveFinalPrice(id); showAlert("success", `Price approved! Start OTP: ${res.data.data?.startOTP}`); refreshData(); }
    catch (err) { showAlert("error", err.response?.data?.message || "Failed to approve price"); }
    finally { setActionLoading(false); }
  };

  const handleRejectFinalPrice = async () => {
    try { setActionLoading(true); await rejectFinalPrice(id, { reason: "Price not acceptable" }); showAlert("success", "Booking cancelled."); refreshData(); }
    catch (err) { showAlert("error", "Failed to reject price"); }
    finally { setActionLoading(false); }
  };

  const handleConfirmPayment = async (otp, paymentMethod) => {
    if (otp.length < 4) { showAlert("error", "Enter 4-digit OTP"); return; }
    try { setActionLoading(true); await confirmPayment(id, { otp, paymentMethod }); showAlert("success", "Payment confirmed! Job completed."); refreshData(); }
    catch (err) { showAlert("error", err.response?.data?.message || "Invalid OTP"); }
    finally { setActionLoading(false); }
  };

  const handleCancelBooking = async () => {
    try { setActionLoading(true); await cancelBooking(id, { reason: cancelReason }); setShowCancelModal(false); showAlert("success", "Booking cancelled."); refreshData(); }
    catch (err) { showAlert("error", "Failed to cancel booking"); }
    finally { setActionLoading(false); }
  };

  const handleApprovePriceRevision = async (revisionId) => {
    try { setActionLoading(true); await approvePriceRevision(id, revisionId, { approve: true }); showAlert("success", "Price revision approved!"); refreshData(); }
    catch (err) { showAlert("error", err.response?.data?.message || "Failed"); }
    finally { setActionLoading(false); }
  };

  const handleRejectPriceRevision = async (revisionId) => {
    try { setActionLoading(true); await approvePriceRevision(id, revisionId, { approve: false }); showAlert("success", "Price revision rejected."); refreshData(); }
    catch (err) { showAlert("error", "Failed"); }
    finally { setActionLoading(false); }
  };

  const handleApproveSchedule = async () => {
    try { setActionLoading(true); await approveScheduleUpdate(id); showAlert("success", "Schedule approved!"); refreshData(); }
    catch (err) { showAlert("error", "Failed to approve schedule"); }
    finally { setActionLoading(false); }
  };

  const handleRespondReschedule = async (action) => {
    try { setActionLoading(true); await respondToReschedule(id, { action }); showAlert("success", action === "approve" ? "Schedule updated" : "Request rejected"); refreshData(); }
    catch (err) { showAlert("error", "Failed"); }
    finally { setActionLoading(false); }
  };

  /* ── Loading / Not found states ── */
  if (loading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading booking details...</p>
          </div>
        </div>
      </>
    );

  if (!booking)
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
      </>
    );

  const meta        = statusMeta[booking.status] || statusMeta.posted;
  const isCancelled = booking.status === "cancelled";
  const canCancel   = !["work_in_progress", "completed", "cancelled"].includes(booking.status);
  const hasPendingRevisions = (booking.priceRevisions || []).some((r) => r.status === "pending");
  const hasScheduleUpdate   = booking.schedule?.scheduledStartDate && !booking.schedule?.approvedByResident &&
    ["price_approved", "work_in_progress"].includes(booking.status);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Alert Banner */}
          {alertMsg && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${alertMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
              {alertMsg.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
              <p className="text-sm font-medium">{alertMsg.text}</p>
            </div>
          )}

          {/* Page Header */}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate("/my-bookings")} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50">
              <FaArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-mono">
                #{booking.bookingId || booking._id?.slice(-8).toUpperCase()}
              </p>
              <h1 className="text-xl font-bold text-gray-800">Booking Details</h1>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${meta.color}`}>
              <meta.icon className="w-3 h-3" /> {meta.label}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <BookingProgressBar currentStep={meta.step} cancelled={isCancelled} />
            <div className={`mt-4 p-3 rounded-xl text-sm flex items-start gap-2 ${meta.color}`}>
              <meta.icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{meta.message}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Left Column: Main Actions ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Job Description */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaClipboardList className="text-blue-600" /> Job Description
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
                      <img key={i} src={buildMediaUrl(img)} alt="" className="w-24 h-24 rounded-xl object-cover border-2 border-gray-100" />
                    ))}
                  </div>
                )}
                <div className="flex items-start gap-2 text-gray-600 bg-gray-50 rounded-xl p-3">
                  <FaMapMarkerAlt className="mt-0.5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm">{booking.address}</span>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Posted:{" "}
                  {new Date(booking.createdAt).toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric", year: "numeric",
                  })}
                </p>
              </div>

              {/* Offers List */}
              {["posted", "offers_received"].includes(booking.status) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FaBell className="text-purple-600" /> Worker Offers
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
                        <OfferCard key={offer._id} offer={offer} onAccept={handleAcceptOffer} actionLoading={actionLoading} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Status Panels */}
              {booking.status === "inspection_requested" && (
                <InspectionRequestedPanel booking={booking} onRespond={handleRespondToInspection} actionLoading={actionLoading} />
              )}
              {booking.status === "inspection_approved" && (
                <InspectionApprovedPanel booking={booking} />
              )}
              {booking.status === "awaiting_price_approval" && (
                <PriceApprovalPanel booking={booking} onApprove={handleApproveFinalPrice} onReject={handleRejectFinalPrice} actionLoading={actionLoading} />
              )}
              {booking.status === "price_approved" && (
                <StartOTPPanel booking={booking} />
              )}
              {booking.status === "work_in_progress" && (
                <>
                  {hasPendingRevisions && (
                    <PriceRevisionPanel booking={booking} onApprove={handleApprovePriceRevision} onReject={handleRejectPriceRevision} actionLoading={actionLoading} />
                  )}
                  {hasScheduleUpdate && (
                    <ScheduleUpdatePanel booking={booking} onApprove={handleApproveSchedule} actionLoading={actionLoading} />
                  )}
                  <RescheduleRequestPanel booking={booking} onRespond={handleRespondReschedule} actionLoading={actionLoading} />
                  <ConfirmPaymentPanel booking={booking} onConfirm={handleConfirmPayment} actionLoading={actionLoading} />
                </>
              )}
              {booking.status === "completed"  && <CompletedPanel booking={booking} />}
              {booking.status === "cancelled"   && <CancelledPanel booking={booking} />}
            </div>

            {/* ── Right Column: Sidebar Info ── */}
            <div className="space-y-4">

              {/* Assigned Worker */}
              {booking.selectedProvider ? (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaTools className="text-blue-600 w-4 h-4" /> Assigned Worker
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                      {booking.selectedProvider.profileImage ? (
                        <img src={buildMediaUrl(booking.selectedProvider.profileImage)} alt="" className="w-full h-full object-cover" />
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
                      <FaPhone /> Call Worker
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

              {/* Booking Info */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Booking Info</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>{meta.label}</span>
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
                      <span className="font-bold text-gray-800">Rs. {booking.finalPrice.totalAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {booking.inspection?.fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Inspection Fee</span>
                      <span className="font-medium text-gray-800">Rs. {booking.inspection.fee}</span>
                    </div>
                  )}
                  {booking.schedule?.scheduledStartDate && (
                    <>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Scheduled</span>
                          <span className="text-gray-700 text-xs">
                            {new Date(booking.schedule.scheduledStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                      {booking.schedule.estimatedDuration?.value > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Duration</span>
                          <span className="text-gray-700">
                            {booking.schedule.estimatedDuration.value}{" "}{booking.schedule.estimatedDuration.unit}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Posted</span>
                    <span className="text-gray-700">
                      {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              <PriceRevisionHistory revisions={booking.priceRevisions} />

              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-3 border-2 border-red-200 text-red-600 rounded-2xl font-medium hover:bg-red-50 hover:border-red-400 transition-all text-sm"
                >
                  <FaTimesCircle className="inline mr-2" /> Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelBookingModal
          booking={booking}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          onConfirm={handleCancelBooking}
          onClose={() => setShowCancelModal(false)}
          actionLoading={actionLoading}
        />
      )}

      <Footer />
    </>
  );
}

