import React from "react";
import { FaCheckCircle, FaTimesCircle, FaClock, FaExclamationCircle, FaUser, FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { formatImagePath } from "../../../utils/formatPath";

const WorkerListTable = ({ workers }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Provider</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Experience</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pricing</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {workers.map((worker) => {
              const user = worker.userId || {};
              const profileImageUrl = formatImagePath(worker.profileImage || user?.profileImage);
              
              return (
                <tr key={worker._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-xl object-cover shadow-sm bg-gray-50"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {user.full_name?.charAt(0)?.toUpperCase() || <FaUser />}
                          </div>
                        )}
                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          worker.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 text-sm truncate">{user.full_name || "Unknown"}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 font-bold">
                          <FaMapMarkerAlt className="w-2.5 h-2.5" />
                          {user.city || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(worker.kycStatus)}`}>
                      {worker.kycStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-gray-700">{worker.experience || 0} Years</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Exp</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-blue-600">Rs. {worker.hourlyRate || 0}<span className="text-[10px] text-gray-400">/hr</span></p>
                      <p className="text-sm font-black text-emerald-600">Rs. {worker.visitPrice || 0}<span className="text-[10px] text-gray-400"> visit</span></p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-100">
                        <FaStar className="w-3 h-3" />
                        <span className="text-xs font-black">{worker.rating || 0}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">({worker.ratingCount || 0} reviews)</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkerListTable;
