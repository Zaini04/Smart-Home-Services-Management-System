import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateKyc, getPendingWorkers } from "../../api/adminEndPoints";
import {
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIdCard,
  FaBriefcase,
  FaExclamationTriangle,
  FaClock,
  FaCalendarAlt,
  FaStar,
  FaWallet,
} from "react-icons/fa";

// Components
import KycInfoCard from "../../components/admin/kyc/KycInfoCard";
import KycDocumentCard from "../../components/admin/kyc/KycDocumentCard";
import KycImageModal from "../../components/admin/kyc/KycImageModal";
import { formatImagePath } from "../../utils/formatPath";

export default function UpdateKyc() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState("");
  
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchWorker();
  }, [id]);

  const fetchWorker = async () => {
    try {
      const res = await getPendingWorkers();
      const found = res.data?.data?.find(w => w._id === id);
      if (found) {
        setWorker(found);
      } else {
        setError("Worker request not found or already processed.");
      }
    } catch (err) {
      setError("Failed to load worker details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (status === 'rejected' && !adminNote.trim()) {
      setError("Please provide a reason for rejection in the admin note.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await updateKyc(id, { kycStatus: status, adminNote });
      navigate("/admin/pending-workers");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update KYC status.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading worker documentation...</p>
      </div>
    );
  }

  if (error && !worker) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto mt-10">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Error</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <button
          onClick={() => navigate("/admin/pending-workers")}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 mx-auto"
        >
          <FaArrowLeft /> Back to Pending List
        </button>
      </div>
    );
  }

  const user = worker?.userId;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/pending-workers")}
            className="p-3 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review KYC Request</h1>
            <p className="text-gray-500 mt-1">Provider ID: <span className="font-mono text-blue-600 font-bold">{id.slice(-8).toUpperCase()}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold text-sm flex items-center gap-2">
            <FaClock className="w-4 h-4" />
            Awaiting Review
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex items-center gap-3 animate-shake">
          <FaExclamationTriangle className="flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info Cards */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KycInfoCard icon={FaUser} label="Full Name" value={user?.full_name} color="bg-blue-500" />
            <KycInfoCard icon={FaEnvelope} label="Email Address" value={user?.email} color="bg-indigo-500" />
            <KycInfoCard icon={FaPhone} label="Phone Number" value={user?.phone} color="bg-green-500" />
            <KycInfoCard icon={FaMapMarkerAlt} label="City" value={user?.city} color="bg-red-500" />
            <KycInfoCard icon={FaIdCard} label="CNIC Number" value={worker?.cnic} color="bg-purple-500" />
            <KycInfoCard icon={FaCalendarAlt} label="Age" value={`${worker?.age} Years`} color="bg-pink-500" />
            <KycInfoCard icon={FaBriefcase} label="Experience" value={`${worker?.experience} Years`} color="bg-amber-500" />
            <KycInfoCard icon={FaStar} label="Self Rating" value={worker?.rating} color="bg-yellow-500" />
            <KycInfoCard icon={FaWallet} label="Visit Price" value={`PKR ${worker?.visitPrice}`} color="bg-teal-500" />
            <KycInfoCard icon={FaDollarSign} label="Hourly Rate" value={`PKR ${worker?.hourlyRate}`} color="bg-emerald-500" />
          </div>

          {/* About Section */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              About the Provider
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg italic bg-gray-50 p-6 rounded-2xl border-l-4 border-blue-200">
              "{worker?.description || "No description provided."}"
            </p>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
              Verification Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KycDocumentCard 
                label="Profile Photo" 
                imagePath={worker?.profileImage || user?.profileImage} 
                onView={(src, label) => setPreviewImage({ src, label })}
              />
              <KycDocumentCard 
                label="CNIC Front" 
                imagePath={worker?.cnicFrontImage} 
                onView={(src, label) => setPreviewImage({ src, label })}
              />
              <KycDocumentCard 
                label="CNIC Back" 
                imagePath={worker?.cnicBackImage} 
                onView={(src, label) => setPreviewImage({ src, label })}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Review Form */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-xl sticky top-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaCheckCircle className="text-blue-600" />
              Final Decision
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Admin Notes / Rejection Reason
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Provide feedback for the worker..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                />
                <p className="mt-2 text-xs text-gray-400">
                  This note will be visible to the worker if their request is rejected.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={submitting}
                  className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  Approve Provider
                </button>
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={submitting}
                  className="w-full py-4 bg-white border-2 border-red-600 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
                  Reject KYC Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Preview */}
      {previewImage && (
        <KycImageModal 
          src={previewImage.src} 
          alt={previewImage.label} 
          onClose={() => setPreviewImage(null)} 
        />
      )}
      
      <style jsx>{`
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}