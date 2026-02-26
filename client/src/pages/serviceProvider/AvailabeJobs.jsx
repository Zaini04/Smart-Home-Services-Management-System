import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaSpinner,
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaImages,
  FaFilter,
  FaArrowRight,
  FaExclamationTriangle,
  FaBell,
} from "react-icons/fa";
import {
  getAvailableBookings,
  sendOrUpdateOffer,
} from "../../api/serviceProviderEndPoints";

/* ── Offer Modal ── */
function OfferModal({ booking, onClose, onSubmit, submitting }) {
  const [laborEstimate, setLaborEstimate] = useState("");
  const [message, setMessage] = useState("");
  const [inspectionRequired, setInspectionRequired] = useState(false);
  const [proposedInspectionFee, setProposedInspectionFee] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!laborEstimate || Number(laborEstimate) <= 0) {
      setError("Please enter a valid labor estimate");
      return;
    }
    onSubmit({
      laborEstimate: Number(laborEstimate),
      message,
      inspectionRequired,
      proposedInspectionFee: inspectionRequired
        ? Number(proposedInspectionFee) || 0
        : 0,
    });
  };

  const commission = laborEstimate
    ? Math.round(Number(laborEstimate) * 0.15)
    : 0;
  const earning = laborEstimate ? Number(laborEstimate) - commission : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              {booking.hasBid ? "Update Your Offer" : "Send an Offer"}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaTimesCircle className="text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {booking.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">
              <FaExclamationTriangle />
              {error}
            </div>
          )}

          {/* Labor Estimate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Labor Estimate (Rs.) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                Rs.
              </span>
              <input
                type="number"
                value={laborEstimate}
                onChange={(e) => setLaborEstimate(e.target.value)}
                placeholder="e.g. 2500"
                min="1"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Earnings Preview */}
          {laborEstimate && Number(laborEstimate) > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Your Quote</span>
                <span className="font-medium">
                  Rs. {Number(laborEstimate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee (15%)</span>
                <span className="text-red-600">
                  - Rs. {commission.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-green-200 pt-1">
                <span className="text-green-700">Your Earning</span>
                <span className="text-green-700">
                  Rs. {earning.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Message to Resident{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Briefly explain your experience or approach..."
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none resize-none transition-all text-sm"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {message.length}/300
            </p>
          </div>

          {/* Inspection Toggle */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  Inspection Required?
                </p>
                <p className="text-xs text-gray-500">
                  Toggle if you need to visit before quoting final price
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectionRequired(!inspectionRequired)}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  inspectionRequired ? "bg-amber-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    inspectionRequired ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            {inspectionRequired && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Inspection Fee (Rs.)
                </label>
                <input
                  type="number"
                  value={proposedInspectionFee}
                  onChange={(e) => setProposedInspectionFee(e.target.value)}
                  placeholder="e.g. 300"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border-2 border-amber-200 focus:border-amber-400 outline-none text-sm"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaCheckCircle />
              )}
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

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await getAvailableBookings();
      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        showAlert("error", err.response.data.message || "Profile not approved yet");
      }
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleSendOffer = async (data) => {
    try {
      setSubmitting(true);
      await sendOrUpdateOffer(selectedJob._id, data);
      showAlert(
        "success",
        selectedJob.hasBid
          ? "Offer updated successfully!"
          : "Offer sent successfully!"
      );
      setSelectedJob(null);
      fetchJobs();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to send offer");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = jobs.filter(
    (j) =>
      j.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Alert */}
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
                <FaExclamationTriangle className="flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{alertMsg.text}</p>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Available Jobs
              </h1>
              <p className="text-gray-500 text-sm">
                {loading ? "Loading..." : `${jobs.length} jobs available`}
              </p>
            </div>
            <Link
              to="/provider/my-offers"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              <FaBell className="text-blue-600" />
              My Offers
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by description, area, or category..."
              className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm"
            />
          </div>

          {/* Jobs List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="text-center">
                <FaSpinner className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-gray-500">Loading available jobs...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <FaClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? "No matching jobs" : "No Jobs Available"}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try a different search term"
                  : "Check back later for new job postings"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((job) => (
                <div
                  key={job._id}
                  className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${
                    job.hasBid
                      ? "border-green-200 bg-green-50/30"
                      : "border-gray-100 hover:border-blue-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                      {job.images?.[0] ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/${job.images[0]}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaClipboardList className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Category + Badge */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {job.category?.name || "General"}
                        </span>
                        {job.hasBid ? (
                          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <FaCheckCircle className="w-3 h-3" />
                            Offer Sent
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {job.offerCount || 0} offers
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="font-medium text-gray-800 line-clamp-2 text-sm mb-2">
                        {job.description}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {job.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUser className="text-gray-400" />
                          {job.resident?.name || "Resident"}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          {new Date(job.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {job.images?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <FaImages className="text-gray-400" />
                            {job.images.length} photo
                            {job.images.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            job.hasBid
                              ? "bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md"
                          }`}
                        >
                          <FaMoneyBillWave className="w-3.5 h-3.5" />
                          {job.hasBid ? "Update Offer" : "Send Offer"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {selectedJob && (
        <OfferModal
          booking={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSubmit={handleSendOffer}
          submitting={submitting}
        />
      )}

    </>
  );
}