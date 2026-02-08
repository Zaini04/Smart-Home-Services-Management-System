import { useEffect, useState } from "react";
import { getAllWorkers } from "../../api/adminEndPoints"; // Ensure this matches your export name
import {
  FaSearch,
  FaSpinner,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaBriefcase,
  FaStar,
  FaRedo,
  FaExclamationCircle,
  FaTimes,
  FaUser,
  FaBan
} from "react-icons/fa";

// Base URL for images
const BASE_URL = "http://localhost:5000";

// Helper to format image path
const formatImagePath = (path) => {
  if (!path) return null;
  let formattedPath = path.replace(/\\/g, '/');
  if (!formattedPath.startsWith('/')) {
    formattedPath = '/' + formattedPath;
  }
  return `${BASE_URL}${formattedPath}`;
};

/* ------------------ PROVIDER CARD COMPONENT ------------------ */

const ProviderCard = ({ worker }) => {
  const user = worker.userId;
  
  // Status Colors Logic
  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="w-3.5 h-3.5" />;
      case 'rejected': return <FaTimesCircle className="w-3.5 h-3.5" />;
      case 'pending': return <FaClock className="w-3.5 h-3.5" />;
      default: return <FaExclamationCircle className="w-3.5 h-3.5" />;
    }
  };

  const profileImageUrl = formatImagePath(worker.profileImage || user?.profileImage);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
      
      {/* Top Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 border ${getStatusStyle(worker.kycStatus)}`}>
          {getStatusIcon(worker.kycStatus)}
          {worker.kycStatus}
        </span>

        {/* Online/Offline Badge */}
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg ${
          worker.status === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
        }`}>
          <span className={`w-2 h-2 rounded-full ${worker.status === 'online' ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
          {worker.status === 'online' ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={user?.full_name}
              className="w-16 h-16 rounded-2xl object-cover shadow-sm bg-gray-50"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center text-white font-bold text-xl shadow-md ${profileImageUrl ? 'hidden' : 'flex'}`}>
            {user?.full_name?.charAt(0)?.toUpperCase() || <FaUser />}
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 text-lg truncate leading-tight mb-1">
            {user?.full_name || "Unknown User"}
          </h3>
          <p className="text-sm text-gray-500 truncate mb-2">{user?.email}</p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FaPhone className="text-gray-400" /> {user?.phone || "N/A"}
            </span>
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt className="text-gray-400" /> {user?.city || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-0.5">Rating</p>
          <p className="font-bold text-gray-900 flex items-center justify-center gap-1">
            <FaStar className="text-yellow-400 w-3 h-3" /> {worker.rating || 0}
          </p>
        </div>
        <div className="text-center border-l border-gray-100">
          <p className="text-xs text-gray-400 mb-0.5">Exp</p>
          <p className="font-bold text-gray-900">{worker.experience || 0} Yrs</p>
        </div>
        <div className="text-center border-l border-gray-100">
          <p className="text-xs text-gray-400 mb-0.5">Rate/Hr</p>
          <p className="font-bold text-blue-600">{worker.hourlyRate || 0}</p>
        </div>
      </div>

      {/* Categories Tags */}
      {worker.serviceCategories?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {worker.serviceCategories.slice(0, 3).map((cat, i) => (
            <span key={cat._id} className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-medium rounded-md border border-gray-100">
              {cat.name}
            </span>
          ))}
          {worker.serviceCategories.length > 3 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] font-medium rounded-md">
              +{worker.serviceCategories.length - 3} more
            </span>
          )}
        </div>
      )}
      
      {/* Action Area (Placeholder for future features) */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
         {/* You can add Block/View Details buttons here later */}
         {worker.kycStatus === 'approved' && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
               <FaCheckCircle/> Verified Account
            </span>
         )}
      </div>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function AllWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, approved, pending, rejected

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await getAllWorkers();
      setWorkers(res.data.data || []);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      // If 404 (no workers), just set empty array
      if (err.response?.status === 404) {
        setWorkers([]);
      } else {
        setError("Failed to load providers.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredWorkers = workers.filter((worker) => {
    const user = worker.userId || {};
    
    const matchesSearch = 
      (user.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.phone || "").includes(searchQuery) ||
      (worker.serviceCategories || []).some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" ? true : worker.kycStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats for Header
  const total = workers.length;
  const approved = workers.filter(w => w.kycStatus === 'approved').length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">All Providers</h1>
          <p className="text-gray-500 mt-1">Manage and view all registered service providers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchWorkers}
            className="p-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <FaRedo className={loading ? "animate-spin" : ""} />
          </button>
          <div className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl text-sm border border-blue-100">
             {total} Total / {approved} Active
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, phone or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto w-full md:w-auto">
          {['all', 'approved', 'pending', 'rejected'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 text-sm font-medium capitalize rounded-lg transition-all whitespace-nowrap flex-1 md:flex-none ${
                statusFilter === filter 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
          <FaExclamationCircle /> {error}
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <FaSpinner className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading providers database...</p>
        </div>
      ) : workers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Providers Found</h3>
          <p className="text-gray-500 mt-1">There are no service providers registered yet.</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaFilter className="text-gray-400 text-xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No matches found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
          <button onClick={() => {setSearchQuery(''); setStatusFilter('all')}} className="mt-4 text-blue-600 font-medium hover:underline">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => (
            <ProviderCard key={worker._id} worker={worker} />
          ))}
        </div>
      )}
    </div>
  );
}