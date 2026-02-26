import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaShieldAlt, FaClock, FaCheckCircle, FaTimesCircle,
  FaEdit, FaSignOutAlt, FaSpinner, FaExclamationTriangle,
  FaIdCard, FaTools, FaPhone,
} from "react-icons/fa";
import { getProviderDashboard } from "../../api/serviceProviderEndPoints";

export default function KYCStatus() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [provider, setProvider]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [kycStatus, setKycStatus] = useState("pending");
  const [kycMessage, setKycMessage] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchStatus();
  }, [user]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await getProviderDashboard();
      const data = res.data.data?.provider;
      console.log("Provider Data:", data);
      setProvider(data);
      setKycStatus(data?.kycStatus || "pending");
      setKycMessage(data?.kycMessage || "");

      /* If approved, go to dashboard */
      if (data?.kycStatus === "approved") {
        navigate("/provider/dashboard", { replace: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br
                      from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Checking your status...</p>
        </div>
      </div>
    );
  }

  /* ── Status configs ── */
  const statusConfig = {
    pending: {
      icon: FaClock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-500",
      title: "Profile Under Review",
      subtitle: "Your profile has been submitted successfully!",
      badgeColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
      badgeText: "⏳ Pending Review",
      cardBorder: "border-yellow-200",
      cardBg: "bg-yellow-50",
    },
    rejected: {
      icon: FaTimesCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      title: "Profile Needs Updates",
      subtitle: "Your profile was reviewed and needs some changes.",
      badgeColor: "bg-red-100 text-red-700 border-red-200",
      badgeText: "✗ Changes Required",
      cardBorder: "border-red-200",
      cardBg: "bg-red-50",
    },
    approved: {
      icon: FaCheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-500",
      title: "Profile Approved!",
      subtitle: "You can now start accepting jobs.",
      badgeColor: "bg-green-100 text-green-700 border-green-200",
      badgeText: "✓ Approved",
      cardBorder: "border-green-200",
      cardBg: "bg-green-50",
    },
  };

  const conf = statusConfig[kycStatus] || statusConfig.pending;
  const StatusIcon = conf.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50
                    flex flex-col">

      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg
                            flex items-center justify-center">
              <FaTools className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800">WorkerPanel</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm
                       font-medium transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
          >
            <FaSignOutAlt className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg">

          {/* Status Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

            {/* Top colored strip */}
            <div className={`h-2 w-full ${
              kycStatus === "approved" ? "bg-green-500"
              : kycStatus === "rejected" ? "bg-red-500"
              : "bg-yellow-400"
            }`} />

            <div className="p-8">
              {/* Icon + Title */}
              <div className="text-center mb-6">
                <div className={`w-20 h-20 ${conf.iconBg} rounded-full flex items-center
                                 justify-center mx-auto mb-4 shadow-sm`}>
                  <StatusIcon className={`w-10 h-10 ${conf.iconColor} ${
                    kycStatus === "pending" ? "animate-pulse" : ""
                  }`} />
                </div>
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm
                                  font-semibold border ${conf.badgeColor} mb-4`}>
                  {conf.badgeText}
                </span>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{conf.title}</h1>
                <p className="text-gray-500">{conf.subtitle}</p>
              </div>

              {/* Status-specific content */}

              {/* PENDING */}
              {kycStatus === "pending" && (
                <div className={`${conf.cardBg} border ${conf.cardBorder} rounded-2xl p-5 mb-6`}>
                  <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                    <FaClock className="w-4 h-4" />
                    What happens next?
                  </h3>
                  <div className="space-y-3">
                    {[
                      { step: "1", text: "Our admin team reviews your profile & documents" },
                      { step: "2", text: "CNIC verification is completed" },
                      { step: "3", text: "You receive approval notification" },
                      { step: "4", text: "Start accepting jobs immediately!" },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 text-xs
                                        font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {item.step}
                        </div>
                        <p className="text-yellow-800 text-sm">{item.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <p className="text-yellow-700 text-xs flex items-center gap-1.5">
                      <FaClock className="w-3 h-3" />
                      Typical review time: 24–48 hours
                    </p>
                  </div>
                </div>
              )}

              {/* REJECTED */}
              {kycStatus === "rejected" && (
                <div className={`${conf.cardBg} border ${conf.cardBorder} rounded-2xl p-5 mb-6`}>
                  <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <FaExclamationTriangle className="w-4 h-4" />
                    Reason for Rejection
                  </h3>
                  <p className="text-red-700 text-sm leading-relaxed bg-white rounded-xl p-3
                                border border-red-200">
                    {kycMessage || "Please review your profile information and documents, then resubmit."}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    <p className="text-red-700 text-xs font-semibold">Common issues:</p>
                    {[
                      "Blurry or unclear CNIC images",
                      "Incomplete profile information",
                      "Invalid or mismatch in CNIC details",
                      "Profile photo doesn't meet requirements",
                    ].map((issue) => (
                      <p key={issue} className="text-red-600 text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {issue}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Summary */}
              {provider && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Submitted Profile
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                      {provider.profileImage ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/${provider.profileImage}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaIdCard className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">
                        {provider.userId?.name || "Provider"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {provider.serviceCategories?.map(c => c.name || c).join(", ") || "No categories"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <FaIdCard className="w-3 h-3" />
                        CNIC: {provider.cnic || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {kycStatus === "rejected" && (
                  <Link
                    to="/provider/edit-profile"
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600
                               text-white rounded-2xl font-semibold flex items-center
                               justify-center gap-2 hover:shadow-lg transition-all"
                  >
                    <FaEdit className="w-4 h-4" />
                    Update & Resubmit Profile
                  </Link>
                )}

                {kycStatus === "pending" && (
                  <button
                    onClick={fetchStatus}
                    className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-orange-400
                               text-white rounded-2xl font-semibold flex items-center
                               justify-center gap-2 hover:shadow-lg transition-all"
                  >
                    <FaSpinner className="w-4 h-4" />
                    Refresh Status
                  </button>
                )}

                {/* Contact support */}
                <a
                  href="tel:+92300000000"
                  className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700
                             rounded-2xl font-medium flex items-center justify-center gap-2
                             hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
                >
                  <FaPhone className="w-4 h-4 text-gray-500" />
                  Contact Support
                </a>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 text-red-500 text-sm font-medium flex items-center
                             justify-center gap-2 hover:bg-red-50 rounded-2xl transition-colors"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-gray-400 text-xs mt-6">
            Having trouble?{" "}
            <a href="mailto:support@workerapp.com"
               className="text-blue-500 hover:underline">
              support@workerapp.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}