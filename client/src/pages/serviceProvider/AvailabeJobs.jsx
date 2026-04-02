import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaSearch, FaMapMarkerAlt, FaClock, FaUser, FaSpinner,
  FaClipboardList, FaCheckCircle, FaTimesCircle, FaMoneyBillWave,
  FaExclamationTriangle, FaBell, FaWallet,
} from "react-icons/fa";
import { getAvailableBookings, sendOrUpdateOffer } from "../../api/serviceProviderEndPoints";
import { calculateCommission, MIN_WALLET_BALANCE } from "../../utils/commissionCalc";
import { io } from "socket.io-client";

/* ── Offer Modal ── */
function OfferModal({ booking, onClose, onSubmit, submitting, walletBalance, canSendOffers }) {
  const [laborEstimate, setLaborEstimate] = useState(
    booking.myOffer?.laborEstimate?.toString() || ""
  );
  const [message, setMessage] = useState(booking.myOffer?.message || "");
  const [error, setError] = useState("");

  const labor = Number(laborEstimate) || 0;
  const comm = labor > 0 ? calculateCommission(labor, 0) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!laborEstimate || labor <= 0) {
      setError("Please enter a valid labor estimate");
      return;
    }
    if (!canSendOffers) {
      setError(`Minimum wallet balance of Rs. ${MIN_WALLET_BALANCE.toLocaleString()} required`);
      return;
    }
    onSubmit({
      laborEstimate: labor,
      message,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              {booking.hasBid ? "Update Your Offer" : "Send an Offer"}
            </h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200">
              <FaTimesCircle className="text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{booking.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!canSendOffers && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <FaWallet className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-700 text-sm font-medium">Insufficient Wallet Balance</p>
                <p className="text-red-600 text-xs">
                  Balance: Rs. {walletBalance?.toLocaleString()} — Need Rs. {MIN_WALLET_BALANCE.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">
              <FaExclamationTriangle />{error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Labor Estimate (Rs.) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">Rs.</span>
              <input type="number" value={laborEstimate} onChange={(e) => setLaborEstimate(e.target.value)}
                placeholder="e.g. 2500" min="1" required
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {comm && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Your Quote</span>
                <span className="font-medium">Rs. {labor.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Platform Fee ({comm.ratePercent})
                  {comm.isNewProvider && <span className="text-green-600 ml-1">(50% off!)</span>}
                </span>
                <span className="text-red-600">- Rs. {comm.finalCommission.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-green-200 pt-1">
                <span className="text-green-700">Your Earning</span>
                <span className="text-green-700">Rs. {comm.providerKeeps.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Message <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Briefly explain your approach..." rows={3} maxLength={300}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none resize-none text-sm"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting || !canSendOffers}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
              {booking.hasBid ? "Update Offer" : "Send Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function AvailableJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();



  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);


   useEffect(() => {
    const token = localStorage.getItem("accessToken"); 

    const socket = io(import.meta.env.VITE_BASE_URL || "http://localhost:5000", {
      auth: { token: token },
      withCredentials: true, // 🌟 ADD THIS
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // Listen for the specific event we created on the backend
    socket.on("new_job_posted", () => {
      // Show a nice popup notification (make sure you use showAlert, not standard alert)
      alert("success", "🔔 A new job was just posted in your area!");
      
      // Tell React Query to silently re-fetch the jobs list right now!
      queryClient.invalidateQueries(["availableJobs"]);
    });

    // Cleanup when leaving the page
    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
  // React Query: Fetch and Cache Data
  const { data: fetchResult, isLoading, isError } = useQuery({
    queryKey: ["availableJobs"],
    queryFn: async () => {
      const res = await getAvailableBookings();
      return res.data.data;
    },
    enabled: !!user, // Only fetch if user is logged in
  });

  // Extract variables safely from cached data
  const jobs = fetchResult?.bookings || fetchResult || [];
  const walletWarning = fetchResult?.walletWarning || null;
  const canSendOffers = fetchResult?.canSendOffers !== false;
  const walletBalance = fetchResult?.walletBalance || 0;

  // React Query: Mutation for submitting offers
  const offerMutation = useMutation({
    mutationFn: (data) => sendOrUpdateOffer(selectedJob._id, data),
    onSuccess: (res) => {
      const commInfo = res.data.data?.commissionPreview;
      const msg = commInfo
        ? `Offer sent! Commission: Rs. ${commInfo.estimatedCommission?.toLocaleString()} (${commInfo.commissionRate})`
        : "Offer sent successfully!";
      showAlert("success", msg);
      setSelectedJob(null);
      // Trigger a silent background refresh of the jobs list
      queryClient.invalidateQueries(["availableJobs"]);
    },
    onError: (err) => {
      showAlert("error", err.response?.data?.message || "Failed to send offer");
    },
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleSendOffer = (data) => {
    offerMutation.mutate(data);
  };

  const filtered = jobs.filter((j) =>
    j.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {alertMsg && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
              alertMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {alertMsg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
              <p className="text-sm font-medium">{alertMsg.text}</p>
            </div>
          )}

          {walletWarning && (
            <div className="mb-4 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <FaWallet className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-amber-800">Wallet Balance Low</p>
                <p className="text-amber-700 text-sm">{walletWarning}</p>
              </div>
              <Link to="/provider/wallet" className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 flex-shrink-0">
                Top Up
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Available Jobs</h1>
              <p className="text-gray-500 text-sm">
                {isLoading ? "Loading..." : `${jobs.length} jobs available`}
              </p>
            </div>
            <Link to="/provider/my-offers"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 text-sm"
            >
              <FaBell className="text-blue-600" /> My Offers
            </Link>
          </div>

          <div className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by description, area, or category..."
              className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200 focus:border-blue-500 outline-none shadow-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <FaSpinner className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : isError ? (
            <div className="bg-red-50 p-6 text-center rounded-2xl text-red-600">
              Failed to load jobs. Please try refreshing the page.
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <FaClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? "No matching jobs" : "No Jobs Available"}
              </h3>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((job) => (
                <div key={job._id}
                  className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${
                    job.hasBid ? "border-green-200 bg-green-50/30" : "border-gray-100 hover:border-blue-200"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {job.images?.[0] ? (
                        <img src={`${import.meta.env.VITE_BASE_URL}/${job.images[0]}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaClipboardList className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {job.category?.name || "General"}
                        </span>
                        {job.hasBid ? (
                          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <FaCheckCircle className="w-3 h-3" /> Offer Sent
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {job.offerCount || 0} offers
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800 line-clamp-2 text-sm mb-2">{job.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-gray-400" />{job.address}</span>
                        <span className="flex items-center gap-1"><FaUser className="text-gray-400" />{job.resident?.name || "Resident"}</span>
                        <span className="flex items-center gap-1"><FaClock className="text-gray-400" />
                          {new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <button
                        onClick={() => canSendOffers ? setSelectedJob(job) : showAlert("error", "Top up wallet to send offers")}
                        className={`w-full py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          !canSendOffers ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : job.hasBid ? "bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md"
                        }`}
                      >
                        <FaMoneyBillWave className="w-3.5 h-3.5" />
                        {!canSendOffers ? "Top Up Wallet First" : job.hasBid ? "Update Offer" : "Send Offer"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <OfferModal 
          booking={selectedJob} 
          onClose={() => setSelectedJob(null)}
          onSubmit={handleSendOffer} 
          submitting={offerMutation.isPending} 
          walletBalance={walletBalance} 
          canSendOffers={canSendOffers}
        />
      )}
    </>
  );
}