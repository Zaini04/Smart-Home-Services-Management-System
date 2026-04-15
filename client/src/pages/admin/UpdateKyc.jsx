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
  FaDollarSign,
  FaExpand,
  FaExclamationTriangle,
  FaTimes,
  FaClock,
  FaCalendarAlt,
  FaStar,
  FaWallet,
} from "react-icons/fa";

// Base URL for images
const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// Helper function to format image path
const formatImagePath = (path) => {
  if (!path) return null;
  // Replace backslashes with forward slashes and ensure leading slash
  let formattedPath = path.replace(/\\/g, '/');
  if (!formattedPath.startsWith('/')) {
    formattedPath = '/' + formattedPath;
  }
  return `${BASE_URL}${formattedPath}`;
};

/* ------------------ IMAGE MODAL COMPONENT ------------------ */

const ImageModal = ({ src, alt, onClose }) => {
  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      >
        <FaTimes className="w-6 h-6 text-white" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
        }}
      />
    </div>
  );
};

/* ------------------ INFO CARD COMPONENT ------------------ */

const InfoCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900 truncate">{value || "N/A"}</p>
    </div>
  </div>
);

/* ------------------ DOCUMENT CARD COMPONENT ------------------ */

const DocumentCard = ({ label, imagePath, onView }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = formatImagePath(imagePath);

  if (!imagePath) {
    return (
      <div className="relative">
        <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <FaUser className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No image</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">{label}</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <FaExclamationTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Failed to load</p>
            </div>
          </div>
        )}
        {!imageError && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => onView(imageUrl)}
              className="px-4 py-2 bg-white text-gray-900 font-medium rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <FaExpand className="w-4 h-4" />
              View Full
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mt-2 text-center">{label}</p>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function UpdateKyc() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [viewImage, setViewImage] = useState(null);

  useEffect(() => {
    fetchWorkerDetails();
  }, [providerId]);

  const fetchWorkerDetails = async () => {
    try {
      const res = await getPendingWorkers();
      const found = res.data.data?.find((w) => w._id === providerId);
      if (found) {
        setWorker(found);
        console.log("Worker data:", found); // Debug log
      } else {
        setError("Worker not found");
      }
    } catch (err) {
      console.error("Error fetching worker:", err);
      setError("Failed to fetch worker details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!status) {
      setError("Please select a status");
      return;
    }

    if (status === "rejected" && !message.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await updateKyc(providerId, { status, message: message.trim() });
      setSuccess(`KYC ${status === "approved" ? "approved" : "rejected"} successfully!`);
      setTimeout(() => {
        navigate("/admin/pending-workers");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update KYC status");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <FaSpinner className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading worker details...</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="text-center py-16">
        <FaExclamationTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Worker Not Found</h2>
        <p className="text-gray-500 mb-6">The worker you're looking for doesn't exist or has already been reviewed.</p>
        <button
          onClick={() => navigate("/admin/pending-workers")}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          Back to Pending Workers
        </button>
      </div>
    );
  }

  const user = worker.userId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/pending-workers")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <FaArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Review KYC</h1>
          <p className="text-gray-500">Review and approve or reject worker verification</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <FaCheckCircle className="w-6 h-6 text-green-600" />
          <p className="text-green-700 font-medium">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <FaExclamationTriangle className="w-6 h-6 text-red-600" />
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={() => setError("")} className="ml-auto">
            <FaTimes className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Worker Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4 mb-6">
              {/* Profile Image */}
              <div className="relative">
                {worker.profileImage ? (
                  <img
                    src={formatImagePath(worker.profileImage)}
                    alt={user?.full_name || "Provider"}
                    className="w-20 h-20 rounded-2xl object-cover shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setViewImage(formatImagePath(worker.profileImage))}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/25 ${worker.profileImage ? 'hidden' : 'flex'}`}
                >
                  {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-4 py-2 bg-amber-100 text-amber-700 font-medium rounded-full flex items-center gap-2 text-sm">
                    <FaClock className="w-4 h-4" />
                    Pending Review
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    worker.status === 'online' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {worker.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoCard icon={FaEnvelope} label="Email" value={user?.email} color="bg-blue-500" />
              <InfoCard icon={FaPhone} label="Phone" value={user?.phone} color="bg-green-500" />
              <InfoCard icon={FaMapMarkerAlt} label="Location" value={`${user?.address || ""}, ${user?.city || ""}`} color="bg-purple-500" />
              <InfoCard icon={FaIdCard} label="CNIC" value={worker.cnic} color="bg-amber-500" />
              <InfoCard icon={FaBriefcase} label="Experience" value={`${worker.experience || 0} years`} color="bg-pink-500" />
              <InfoCard icon={FaCalendarAlt} label="Age" value={worker.age ? `${worker.age} years` : "N/A"} color="bg-indigo-500" />
              <InfoCard icon={FaDollarSign} label="Visit Price" value={`PKR ${worker.visitPrice || 0}`} color="bg-teal-500" />
              <InfoCard icon={FaDollarSign} label="Hourly Rate" value={`PKR ${worker.hourlyRate || 0}`} color="bg-cyan-500" />
              <InfoCard icon={FaWallet} label="Wallet Balance" value={`PKR ${worker.walletBalance || 0}`} color="bg-emerald-500" />
              <InfoCard icon={FaStar} label="Rating" value={`${worker.rating || 0} (${worker.ratingCount || 0} reviews)`} color="bg-yellow-500" />
            </div>

            {/* Description */}
            {worker.description && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-2">About / Bio</p>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">
                  {worker.description}
                </p>
              </div>
            )}

            {/* Service Categories */}
            {worker.serviceCategories?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Service Categories</p>
                <div className="flex flex-wrap gap-2">
                  {worker.serviceCategories.map((cat, i) => (
                    <span
                      key={cat._id}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {worker.skills?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill, i) => (
                    <span
                      key={skill._id}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* KYC Documents */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaIdCard className="w-5 h-5 text-blue-600" />
              KYC Documents
            </h3>

            <div className="grid sm:grid-cols-3 gap-6">
              {/* Profile Photo */}
              <DocumentCard
                label="Profile Photo"
                imagePath={worker.profileImage}
                onView={setViewImage}
              />

              {/* CNIC Front */}
              <DocumentCard
                label="CNIC Front"
                imagePath={worker.cnicFrontImage}
                onView={setViewImage}
              />

              {/* CNIC Back */}
              <DocumentCard
                label="CNIC Back"
                imagePath={worker.cnicBackImage}
                onView={setViewImage}
              />
            </div>

            {/* Debug Info - Remove in production */}
            
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Timeline</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Applied On</p>
                <p className="font-medium text-gray-900">
                  {new Date(worker.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last Active</p>
                <p className="font-medium text-gray-900">
                  {new Date(worker.lastActiveAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-6">KYC Decision</h3>

            {/* Status Selection */}
            <div className="space-y-3 mb-6">
              <label
                className={`
                  flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${status === "approved"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="status"
                  value="approved"
                  checked={status === "approved"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-5 h-5 text-green-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className={`w-5 h-5 ${status === "approved" ? "text-green-600" : "text-gray-400"}`} />
                    <span className="font-semibold text-gray-900">Approve</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Verify and activate this provider</p>
                </div>
              </label>

              <label
                className={`
                  flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${status === "rejected"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="status"
                  value="rejected"
                  checked={status === "rejected"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-5 h-5 text-red-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FaTimesCircle className={`w-5 h-5 ${status === "rejected" ? "text-red-600" : "text-gray-400"}`} />
                    <span className="font-semibold text-gray-900">Reject</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Decline this application</p>
                </div>
              </label>
            </div>

            {/* Message Textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Provider {status === "rejected" && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  status === "rejected"
                    ? "Please explain why this application is being rejected..."
                    : "Optional message to the provider..."
                }
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !status}
              className={`
                w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all
                ${!status
                  ? "bg-gray-300 cursor-not-allowed"
                  : status === "approved"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25"
                    : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25"
                }
                ${submitting ? "opacity-75 cursor-not-allowed" : ""}
              `}
            >
              {submitting ? (
                <>
                  <FaSpinner className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : status === "approved" ? (
                <>
                  <FaCheckCircle className="w-5 h-5" />
                  Approve KYC
                </>
              ) : status === "rejected" ? (
                <>
                  <FaTimesCircle className="w-5 h-5" />
                  Reject KYC
                </>
              ) : (
                "Select an Action"
              )}
            </button>

            {/* Cancel Button */}
            <button
              onClick={() => navigate("/admin/pending-workers")}
              className="w-full mt-3 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {viewImage && (
        <ImageModal
          src={viewImage}
          alt="Document"
          onClose={() => setViewImage(null)}
        />
      )}
    </div>
  );
}