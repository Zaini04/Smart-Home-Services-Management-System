// jobDetails/panels/ConflictModal.jsx
import React from "react";
import { FaExclamationTriangle, FaUser, FaCalendarAlt, FaEdit } from "react-icons/fa";

function ConflictModal({ conflict, isExtending, onClose, onMessage, onPickAnother }) {
  if (!conflict) return null;

  const startTime = new Date(conflict.start).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const endTime = new Date(conflict.end).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Cannot Reach Next Job</h3>
        <p className="text-gray-500 text-sm text-center mb-5">{conflict.message || "You have another job scheduled"}</p>
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"><FaUser className="text-orange-600 w-5 h-5" /></div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{conflict.residentName}</p>
              <p className="text-xs text-gray-500">{conflict.category}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <div className="flex items-center gap-2 text-sm mb-1"><FaCalendarAlt className="text-orange-600 w-4 h-4" /><span className="font-medium text-gray-700">{startTime}</span></div>
            <div className="text-xs text-gray-500 ml-6">to {endTime}</div>
          </div>
        </div>
        <div className="space-y-3">
          <button onClick={onPickAnother} className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"><FaEdit className="w-4 h-4" /> Reduce Extension</button>
          <button onClick={() => onMessage(conflict._id)} className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">📅 Update {conflict.residentName}'s Schedule</button>
          <button onClick={onClose} className="w-full py-2.5 text-gray-500 text-sm hover:text-gray-700 transition-colors">Cancel</button>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">💡 <strong>Your Options:</strong></p>
            <ul className="text-xs text-blue-700 ml-4 mt-1 space-y-1">
              <li>• Finish current job earlier to reach next job on time</li>
              <li>• OR update {conflict.residentName}'s schedule to a later time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConflictModal;

