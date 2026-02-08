import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaEdit,
  FaUser,
  FaExclamationTriangle,
  FaRedo,
  FaClock,
  FaEnvelope,
} from "react-icons/fa";
import { getProviderStatus } from "../../api/serviceProviderEndPoints";

export default function KYCStatus() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null); // "pending" | "approved" | "rejected"
  const [message, setMessage] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const userId = user.user_id || user._id;
        const res = await getProviderStatus(userId);
        
        const data = res.data.data;
        setStatus(data.kycStatus);
        setMessage(data.kycMessage || "");
        setProfileImage(data.profileImage || "");
        setUserName(data.user?.name || "Provider");

        // If approved, redirect to dashboard
        if (data.kycStatus === "approved") {
          setTimeout(() => {
            navigate("/provider-dashboard");
          }, 2000);
        }
      } catch (err) {
        console.error("Error fetching status:", err);
        // If no profile found, redirect to complete profile
        if (err.response?.status === 404) {
          navigate("/complete-profile");
        } else {
          setError("Failed to load status. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user, navigate]);

  // Refresh status every 30 seconds when pending
  useEffect(() => {
    let interval;
    if (status === "pending") {
      interval = setInterval(async () => {
        try {
          const userId = user.user_id || user._id;
          const res = await getProviderStatus(userId);
          const newStatus = res.data.data.kycStatus;
          
          if (newStatus !== "pending") {
            setStatus(newStatus);
            setMessage(res.data.data.kycMessage || "");
            
            if (newStatus === "approved") {
              setTimeout(() => navigate("/provider-dashboard"), 2000);
            }
          }
        } catch (err) {
          console.error("Status refresh error:", err);
        }
      }, 30000); // Check every 30 seconds
    }

    return () => clearInterval(interval);
  }, [status, user, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your status...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
            <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Error</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white overflow-hidden bg-white">
                {profileImage ? (
                  <img
                    src={`http://localhost:5000/${profileImage}`}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FaUser className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">{userName}</h2>
              <p className="text-blue-100 mt-1">Service Provider</p>
            </div>
          </div>

          {/* Status Card - PENDING */}
          {status === "pending" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaHourglassHalf className="w-10 h-10 text-yellow-500 animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Profile Under Review
              </h3>
              
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Your profile has been submitted and is currently being reviewed by our admin team. 
                This usually takes 24-48 hours.
              </p>

              {/* Status Timeline */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-gray-500 mt-2">Submitted</span>
                  </div>
                  
                  <div className="w-16 h-1 bg-yellow-400"></div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                      <FaClock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-gray-500 mt-2">Reviewing</span>
                  </div>
                  
                  <div className="w-16 h-1 bg-gray-300"></div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-gray-500 mt-2">Approved</span>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-left">
                <FaEnvelope className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    We'll notify you via email once your profile is reviewed. 
                    You can also check back here for updates.
                  </p>
                </div>
              </div>

              {/* Auto Refresh Indicator */}
              <p className="text-xs text-gray-400 mt-6 flex items-center justify-center gap-2">
                <FaRedo className="w-3 h-3" />
                Auto-refreshing every 30 seconds
              </p>
            </div>
          )}

          {/* Status Card - APPROVED */}
          {status === "approved" && (
            navigate("/provider-dashboard")
            // <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            //   <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            //     <FaCheckCircle className="w-10 h-10 text-green-500" />
            //   </div>
              
            //   <h3 className="text-2xl font-bold text-gray-800 mb-3">
            //     🎉 Congratulations!
            //   </h3>
              
            //   <p className="text-gray-600 mb-6">
            //     Your profile has been approved! You can now start receiving service requests.
            //   </p>

            //   <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
            //     <FaSpinner className="w-4 h-4 animate-spin" />
            //     <span>Redirecting to dashboard...</span>
            //   </div>

            //   <button
            //     onClick={() => navigate("/provider-dashboard")}
            //     className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl 
            //              font-semibold hover:from-green-600 hover:to-green-700 transition-all"
            //   >
            //     Go to Dashboard
            //   </button>
            // </div>
          )}

          {/* Status Card - REJECTED */}
          {status === "rejected" && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTimesCircle className="w-10 h-10 text-red-500" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Profile Needs Updates
                </h3>
                
                <p className="text-gray-600">
                  Unfortunately, your profile was not approved. Please review the feedback below 
                  and make the necessary changes.
                </p>
              </div>

              {/* Admin Message */}
              {message && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">Admin Feedback:</h4>
                      <p className="text-red-700">{message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl 
                           font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all 
                           flex items-center justify-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit & Resubmit Profile
                </button>
              </div>

              {/* Help Text */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Need help? Contact support at support@example.com
              </p>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}