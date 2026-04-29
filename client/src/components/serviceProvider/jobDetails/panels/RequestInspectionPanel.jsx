// jobDetails/panels/RequestInspectionPanel.jsx
import React, { useState } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";

function RequestInspectionPanel({ onRequest, loading }) {
  const [fee, setFee] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)} className="w-full py-3 bg-amber-50 border-2 border-amber-200 text-amber-700 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-amber-100 transition-all">
        <FaSearch className="w-4 h-4" /> Request Inspection
      </button>
    );
  }

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaSearch className="text-amber-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-800">Request Inspection</h3>
          <p className="text-amber-700 text-sm mt-0.5">Set a time to visit and inspect before giving final price.</p>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Fee (Rs.)</label>
          <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="e.g. 300" min="0" className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none text-sm" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date to Visit *</label>
            <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full px-3 py-2.5 rounded-xl border-2 border-amber-200 outline-none text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
            <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border-2 border-amber-200 outline-none text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Why do you need to inspect?" rows={2} className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none text-sm resize-none" />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setExpanded(false)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-medium bg-white">Cancel</button>
        <button onClick={() => onRequest({ fee: Number(fee) || 0, message, scheduledDate, scheduledTime })} disabled={loading || !scheduledDate || !scheduledTime} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />} Send Request
        </button>
      </div>
    </div>
  );
}

export default RequestInspectionPanel;

