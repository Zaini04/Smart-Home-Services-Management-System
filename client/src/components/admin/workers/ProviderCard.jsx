import React from "react";
import { FaCheckCircle, FaTimesCircle, FaClock, FaExclamationCircle, FaUser, FaStar, FaPhone, FaMapMarkerAlt, FaCheck } from "react-icons/fa";
import { formatImagePath } from "../../../utils/formatPath";

const ProviderCard = ({ worker }) => {
  const user = worker.userId;
  
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
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 border ${getStatusStyle(worker.kycStatus)}`}>
          {getStatusIcon(worker.kycStatus)}
          {worker.kycStatus}
        </span>

        <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg ${
          worker.status === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
        }`}>
          <span className={`w-2 h-2 rounded-full ${worker.status === 'online' ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
          {worker.status === 'online' ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="flex items-start gap-4">
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

      {worker.serviceCategories?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {worker.serviceCategories.slice(0, 3).map((cat, i) => (
            <span key={i} className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-medium rounded-md border border-gray-100">
              {typeof cat === 'object' ? cat.name : cat}
            </span>
          ))}
          {worker.serviceCategories.length > 3 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] font-medium rounded-md">
              +{worker.serviceCategories.length - 3} more
            </span>
          )}
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
         {worker.kycStatus === 'approved' && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
               <FaCheckCircle/> Verified Account
            </span>
         )}
      </div>
    </div>
  );
};

export default ProviderCard;
