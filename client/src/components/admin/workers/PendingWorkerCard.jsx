import React from "react";
import { FaUserClock, FaEye, FaMapMarkerAlt, FaPhone, FaBriefcase, FaCheckCircle, FaUser } from "react-icons/fa";
import { formatImagePath } from "../../../utils/formatPath";

const PendingWorkerCard = ({ worker, onReview }) => {
  const user = worker.userId;
  const profileImageUrl = formatImagePath(worker.profileImage || user?.profileImage);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
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
              {user?.full_name?.charAt(0)?.toUpperCase() || <FaUser />}
            </div>
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

      {worker.description && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">About</p>
          <p className="text-sm text-gray-700 line-clamp-2">{worker.description}</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-3">Documents</p>
        <div className="flex gap-3">
          {worker.profileImage && (
            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={formatImagePath(worker.profileImage)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {worker.cnicFrontImage && (
            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={formatImagePath(worker.cnicFrontImage)}
                alt="CNIC Front"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {worker.cnicBackImage && (
            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={formatImagePath(worker.cnicBackImage)}
                alt="CNIC Back"
                className="w-full h-full object-cover"
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

export default PendingWorkerCard;
