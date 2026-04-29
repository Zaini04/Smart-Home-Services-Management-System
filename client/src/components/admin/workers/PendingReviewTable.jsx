import React from "react";
import { FaUserClock, FaEye, FaUser, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { formatImagePath } from "../../../utils/formatPath";

const PendingReviewTable = ({ workers, onReview }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Applicant</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Details</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pricing</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date Applied</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {workers.map((worker) => {
              const user = worker.userId || {};
              const profileImageUrl = formatImagePath(worker.profileImage || user?.profileImage);
              
              return (
                <tr key={worker._id} className="hover:bg-amber-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-xl object-cover shadow-sm bg-gray-50"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            {user.full_name?.charAt(0)?.toUpperCase() || <FaUser />}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 text-sm truncate">{user.full_name || "Unknown"}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <FaMapMarkerAlt className="w-3 h-3 text-gray-300" />
                        {user.city || "N/A"}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold ml-5">{user.phone || "N/A"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-gray-900">Rs. {worker.hourlyRate || 0}<span className="text-[10px] text-gray-400">/hr</span></p>
                      <p className="text-sm font-black text-gray-900">Rs. {worker.visitPrice || 0}<span className="text-[10px] text-gray-400"> visit</span></p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                      <FaCalendarAlt className="text-gray-300" />
                      {new Date(worker.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => onReview(worker)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
                    >
                      <FaEye /> Review
                    </button>
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

export default PendingReviewTable;
