import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaClipboardList,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaArrowRight,
  FaSearch,
  FaExclamationTriangle,
} from "react-icons/fa";
import { getMyOffers } from "../../api/serviceProviderEndPoints";

const offerStatusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-700",
    label: "Pending",
    icon: FaClock,
  },
  accepted: {
    color: "bg-green-100 text-green-700",
    label: "Accepted",
    icon: FaCheckCircle,
  },
  rejected: {
    color: "bg-red-100 text-red-700",
    label: "Rejected",
    icon: FaTimesCircle,
  },
};

export default function MyOffers() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchOffers();
  }, [user]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await getMyOffers();
      setOffers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
  ];

  const filtered =
    activeFilter === "all"
      ? offers
      : offers.filter((o) => o.status === activeFilter);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Offers</h1>
              <p className="text-gray-500 text-sm">
                Track your submitted offers
              </p>
            </div>
            <Link
              to="/provider/available-jobs"
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
            >
              Browse Jobs
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6">
            <div className="flex gap-1">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeFilter === f.key
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Offers List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <FaSpinner className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <FaClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No {activeFilter !== "all" ? activeFilter : ""} Offers
              </h3>
              <p className="text-gray-500 mb-4">
                {activeFilter === "all"
                  ? "You haven't sent any offers yet"
                  : `No ${activeFilter} offers found`}
              </p>
              <Link
                to="/provider/available-jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium"
              >
                Browse Available Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((offer) => {
                const statusConf =
                  offerStatusConfig[offer.status] || offerStatusConfig.pending;
                const StatusIcon = statusConf.icon;
                const booking = offer.booking;
                const commission = Math.round(
                  (offer.laborEstimate || 0) * 0.15
                );
                const earning = (offer.laborEstimate || 0) - commission;

                return (
                  <div
                    key={offer._id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      {/* Booking Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 line-clamp-2 text-sm">
                          {booking?.description || "Job description"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {booking?.address || "No address"}
                        </div>
                      </div>
                      {/* Status */}
                      <span
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConf.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConf.label}
                      </span>
                    </div>

                    {/* Offer Details */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">
                          Your Quote
                        </p>
                        <p className="font-bold text-gray-800">
                          Rs. {offer.laborEstimate?.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">
                          Your Earning
                        </p>
                        <p className="font-bold text-green-700">
                          Rs. {earning.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    {offer.message && (
                      <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg p-2.5 mb-3">
                        "{offer.message}"
                      </p>
                    )}

                    {/* Inspection */}
                    {offer.inspectionRequired && (
                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-3">
                        <FaExclamationTriangle />
                        Inspection required — Fee: Rs.{" "}
                        {offer.proposedInspectionFee || 0}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        {new Date(offer.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {offer.status === "accepted" && booking?._id && (
                        <Link
                          to={`/provider/job/${booking._id}`}
                          className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all"
                        >
                          View Job <FaArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}