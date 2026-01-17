import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPendingWorkers } from "../../api/adminEndPoints";
import {
  FaSearch,
  FaSpinner,
  FaEye,
  FaUserClock,
  FaCheckCircle,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBriefcase,
  FaIdCard,
  FaTimes,
  FaExclamationCircle,
  FaDollarSign,
  FaRedo,
  FaUser,
} from "react-icons/fa";

// Base URL for images
const BASE_URL = "http://localhost:5000";

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

/* ------------------ WORKER CARD COMPONENT ------------------ */

const WorkerCard = ({ worker, onReview }) => {
  const user = worker.userId;
  
  // Get profile image - check worker first, then user
  const profileImageUrl = formatImagePath(worker.profileImage || user?.profileImage);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Avatar & Basic Info */}
        <div className="flex items-center gap-4 flex-1">
          {/* Profile Image */}
          <div className="relative">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={user?.full_name || "Provider"}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/25 ${profileImageUrl ? 'hidden' : 'flex'}`}
            >
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {/* Online/Offline indicator */}
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
              worker.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-lg truncate">{user?.full_name}</h3>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <FaMapMarkerAlt className="w-3 h-3" />
                {user?.city || "Unknown"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <FaPhone className="w-3 h-3" />
                {user?.phone || "N/A"}
              </span>
              {worker.experience && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <FaBriefcase className="w-3 h-3" />
                  {worker.experience} years exp
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">Visit Price</p>
            <p className="font-semibold text-gray-900">PKR {worker.visitPrice || "N/A"}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Hourly Rate</p>
            <p className="font-semibold text-gray-900">PKR {worker.hourlyRate || "N/A"}</p>
          </div>
        </div>

        {/* Status & Action */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-full flex items-center gap-2">
            <FaUserClock className="w-3 h-3" />
            Pending
          </span>
          <button
            onClick={() => onReview(worker)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <FaEye className="w-4 h-4" />
            Review
          </button>
        </div>
      </div>

      {/* Additional Info - Expandable on hover */}
      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500">CNIC</p>
          <p className="font-medium text-gray-900 text-sm">{worker.cnic || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Age</p>
          <p className="font-medium text-gray-900 text-sm">{worker.age || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Rating</p>
          <p className="font-medium text-gray-900 text-sm">{worker.rating || 0} ({worker.ratingCount || 0} reviews)</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Applied On</p>
          <p className="font-medium text-gray-900 text-sm">
            {new Date(worker.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Description if available */}
      {worker.description && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">About</p>
          <p className="text-sm text-gray-700 line-clamp-2">{worker.description}</p>
        </div>
      )}

      {/* Document Preview */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-3">Documents</p>
        <div className="flex gap-3">
          {/* Profile Image Thumbnail */}
          {worker.profileImage && (
            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={formatImagePath(worker.profileImage)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                }}
              />
            </div>
          )}
          {/* CNIC Front Thumbnail */}
          {worker.cnicFrontImage && (
            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={formatImagePath(worker.cnicFrontImage)}
                alt="CNIC Front"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">CNIC</div>';
                }}
              />
            </div>
          )}
          {/* CNIC Back Thumbnail */}
          {worker.cnicBackImage && (
            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={formatImagePath(worker.cnicBackImage)}
                alt="CNIC Back"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">CNIC</div>';
                }}
              />
            </div>
          )}
          {!worker.profileImage && !worker.cnicFrontImage && !worker.cnicBackImage && (
            <span className="text-sm text-gray-400">No documents uploaded</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function GetPendingWorkers() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPendingWorkers();
  }, []);

  const fetchPendingWorkers = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await getPendingWorkers();
      setWorkers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch pending workers:", err);
      if (err.response?.status === 404) {
        setWorkers([]);
      } else {
        setError(err.response?.data?.message || "Failed to fetch pending workers");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (worker) => {
    navigate(`/admin/update-kyc/${worker._id}`);
  };

  const filteredWorkers = workers.filter((worker) =>
    worker.userId?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.userId?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.cnic?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Pending Workers</h1>
          <p className="text-gray-500 mt-1">Review and approve KYC requests from service providers</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={fetchPendingWorkers}
            disabled={loading}
            className="p-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <FaRedo className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <span className="px-4 py-2 bg-amber-100 text-amber-700 font-semibold rounded-xl flex items-center gap-2">
            <FaUserClock className="w-4 h-4" />
            {workers.length} Pending
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <FaExclamationCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={() => setError("")} className="ml-auto">
            <FaTimes className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      {!loading && workers.length > 0 && (
        <div className="relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, city, or CNIC..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Workers List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FaSpinner className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading pending workers...</p>
          </div>
        </div>
      ) : workers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            There are no pending KYC requests at the moment. All workers have been reviewed.
          </p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 mb-4">
            No workers match "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorkers.map((worker) => (
            <WorkerCard key={worker._id} worker={worker} onReview={handleReview} />
          ))}
        </div>
      )}
    </div>
  );
}