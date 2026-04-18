import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FaSearch, FaMapMarkerAlt, FaClock, FaUser, FaSpinner,
  FaClipboardList, FaCheckCircle, FaTimesCircle, FaMoneyBillWave,
  FaExclamationTriangle, FaBell, FaWallet,
} from "react-icons/fa";
import { getAvailableBookings, sendOrUpdateOffer } from "../../api/serviceProviderEndPoints";
import { calculateCommission, MIN_WALLET_BALANCE } from "../../utils/commissionCalc";
import { io } from "socket.io-client";
import { buildMediaUrl, getApiBaseUrl } from "../../utils/url";

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
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900">
              {booking.hasBid ? "Update Your Offer" : "Send an Offer"}
            </h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <FaTimesCircle className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">{booking.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!canSendOffers && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <FaWallet className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 text-sm font-bold mb-1">Insufficient Wallet Balance</p>
                <p className="text-red-600 text-xs font-medium">
                  Balance: Rs. {walletBalance?.toLocaleString()} — Need: Rs. {MIN_WALLET_BALANCE.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm font-medium">
              <FaExclamationTriangle className="flex-shrink-0" />{error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Labor Estimate (Rs.) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
              <input type="number" value={laborEstimate} onChange={(e) => setLaborEstimate(e.target.value)}
                placeholder="2500" min="1" required
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {comm && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-600">Your Quote</span>
                <span className="text-gray-900">Rs. {labor.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-600">
                  Platform Fee ({comm.ratePercent})
                  {comm.isNewProvider && <span className="text-green-600 ml-1 font-bold">(50% off!)</span>}
                </span>
                <span className="text-red-500">- Rs. {comm.finalCommission.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-green-200 pt-2 mt-2 text-lg">
                <span className="text-green-800">Your Earning</span>
                <span className="text-green-700">Rs. {comm.providerKeeps.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Message <span className="text-gray-400 font-medium">(optional)</span>
            </label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Briefly explain your approach..." rows={3} maxLength={300}
              className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none resize-none transition-all text-sm font-medium"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 border border-gray-200 bg-white rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting || !canSendOffers}
              className="flex-1 py-3.5 bg-yellow-500 text-gray-900 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
  const apiBaseUrl = getApiBaseUrl();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("accessToken"); 

    const socket = io(apiBaseUrl, {
      auth: { token: token },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("new_job_posted", () => {
      alert("success", "🔔 A new job was just posted in your area!");
      queryClient.invalidateQueries(["availableJobs"]);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, user, apiBaseUrl]);

  const { data: fetchResult, isLoading, isError } = useQuery({
    queryKey: ["availableJobs"],
    queryFn: async () => {
      const res = await getAvailableBookings();
      return res.data.data;
    },
    enabled: !!user,
  });

  const jobs = fetchResult?.bookings || fetchResult || [];
  const walletWarning = fetchResult?.walletWarning || null;
  const canSendOffers = fetchResult?.canSendOffers !== false;
  const walletBalance = fetchResult?.walletBalance || 0;

  const offerMutation = useMutation({
    mutationFn: (data) => sendOrUpdateOffer(selectedJob._id, data),
    onSuccess: (res) => {
      const commInfo = res.data.data?.commissionPreview;
      const msg = commInfo
        ? `Offer sent! Commission: Rs. ${commInfo.estimatedCommission?.toLocaleString()} (${commInfo.commissionRate})`
        : "Offer sent successfully!";
      showAlert("success", msg);
      setSelectedJob(null);
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
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Alert Messages */}
          {alertMsg && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold ${
              alertMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {alertMsg.type === "success" ? <FaCheckCircle className="w-5 h-5"/> : <FaExclamationTriangle className="w-5 h-5"/>}
              <p className="text-sm">{alertMsg.text}</p>
            </div>
          )}

          {walletWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <FaWallet className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-amber-900 text-lg mb-1">Low Wallet Balance</p>
                  <p className="text-amber-700 text-sm font-medium">{walletWarning}</p>
                </div>
              </div>
              <Link to="/provider/wallet" className="inline-flex justify-center px-6 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 whitespace-nowrap">
                Top Up Balance
              </Link>
            </div>
          )}

          {/* ── HEADER SECTION ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">Available Jobs</h1>
              <p className="text-gray-500 text-sm md:text-base">
                {isLoading ? "Loading..." : `Browse ${jobs.length} new opportunities in your area`}
              </p>
            </div>
            <Link to="/provider/my-offers"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100/80 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-200 transition-all text-sm shadow-sm"
            >
              <FaBell className="text-yellow-500 w-4 h-4" /> My Active Offers
            </Link>
          </div>

          {/* ── SEARCH BAR ── */}
          <div className="relative">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keyword, location, or category..."
              className="w-full pl-14 pr-4 py-4 bg-white rounded-2xl border border-gray-100 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none shadow-sm transition-all font-medium"
            />
          </div>

          {/* ── LIST ── */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <FaSpinner className="w-10 h-10 text-yellow-500 animate-spin" />
            </div>
          ) : isError ? (
            <div className="bg-red-50 border border-red-200 p-6 rounded-3xl text-center text-red-700 font-bold">
              Failed to load jobs. Please try refreshing the page.
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaClipboardList className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {searchTerm ? "No matching jobs" : "No Jobs Available"}
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                There are currently no new jobs posted in your area. We'll notify you when new opportunities arrive.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {filtered.map((job, index) => (
                <motion.div key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`block bg-white rounded-3xl p-5 md:p-7 shadow-sm border transition-all group ${
                    job.hasBid ? "border-green-200 bg-green-50/10 hover:border-green-300" : "border-gray-100 hover:shadow-md hover:border-gray-200"
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* Left: Image Thumbnail */}
                    <div className="w-full md:w-40 h-40 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative">
                      {job.images?.[0] ? (
                        <img src={buildMediaUrl(job.images[0])} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <FaClipboardList className="w-10 h-10 mb-2" />
                          <span className="text-xs font-medium">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                        {job.category?.name || "General"}
                      </div>
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                          {job.description}
                        </h3>
                        {job.hasBid ? (
                          <span className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                            <FaCheckCircle className="w-3.5 h-3.5" /> Sent
                          </span>
                        ) : (
                          <span className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                            {job.offerCount || 0} Offers
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                          <span className="font-medium line-clamp-1 max-w-[200px]">{job.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUser className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{job.resident?.name || "Resident"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto pt-5 border-t border-gray-100">
                        <button
                          onClick={() => canSendOffers ? setSelectedJob(job) : showAlert("error", "Top up wallet to send offers")}
                          className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            !canSendOffers ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : job.hasBid ? "bg-white border-2 border-green-500 text-green-600 hover:bg-green-50"
                            : "bg-yellow-500 text-gray-900 hover:bg-yellow-400 shadow-md shadow-yellow-500/20"
                          }`}
                        >
                          <FaMoneyBillWave className="w-4 h-4" />
                          {!canSendOffers ? "Wallet Top Up Required" : job.hasBid ? "Update Your Offer" : "Send Offer Now"}
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
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