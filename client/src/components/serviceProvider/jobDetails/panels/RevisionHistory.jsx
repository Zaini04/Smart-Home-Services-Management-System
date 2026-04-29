// jobDetails/panels/RevisionHistory.jsx
import React from "react";
import { FaHistory } from "react-icons/fa";

function RevisionHistory({ revisions }) {
  if (!revisions || revisions.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
        <FaHistory className="text-gray-500 w-4 h-4" /> Price Changes
      </h3>
      <div className="space-y-2">
        {revisions.map((rev, i) => (
          <div key={rev._id || i} className="text-sm p-2.5 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rs. {rev.totalAmount?.toLocaleString()}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rev.status === "approved" ? "bg-green-100 text-green-700" : rev.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                {rev.status}
              </span>
            </div>
            {rev.reason && <p className="text-gray-400 text-xs mt-1">{rev.reason}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RevisionHistory;

