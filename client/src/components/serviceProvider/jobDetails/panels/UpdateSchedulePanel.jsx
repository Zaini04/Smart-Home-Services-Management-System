// jobDetails/panels/UpdateSchedulePanel.jsx
import React, { useState } from "react";
import { FaCalendarAlt, FaSpinner } from "react-icons/fa";

function UpdateSchedulePanel({ booking, onSubmit, loading }) {
  const [expanded, setExpanded] = useState(false);
  const [durationValue, setDurationValue] = useState(booking.schedule?.estimatedDuration?.value?.toString() || "");
  const [durationUnit, setDurationUnit] = useState(booking.schedule?.estimatedDuration?.unit || "hours");
  const [startDate, setStartDate] = useState("");

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)} className="w-full py-3 bg-purple-50 border-2 border-purple-200 text-purple-700 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-purple-100">
        <FaCalendarAlt className="w-4 h-4" /> Update Schedule
      </button>
    );
  }

  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
      <h3 className="font-semibold text-purple-800 mb-4">Update Schedule</h3>
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">New Start Date (optional)</label>
          <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().slice(0, 16)} className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 outline-none text-sm" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">New Duration</label>
            <input type="number" value={durationValue} onChange={(e) => setDurationValue(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 outline-none text-sm" />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
            <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
              <button type="button" onClick={() => setDurationUnit("hours")} className={`flex-1 py-2.5 text-sm font-medium ${durationUnit === "hours" ? "bg-purple-600 text-white" : "bg-white text-gray-600"}`}>Hours</button>
              <button type="button" onClick={() => setDurationUnit("days")} className={`flex-1 py-2.5 text-sm font-medium ${durationUnit === "days" ? "bg-purple-600 text-white" : "bg-white text-gray-600"}`}>Days</button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setExpanded(false)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl bg-white">Cancel</button>
        <button onClick={() => { onSubmit({ estimatedDurationValue: Number(durationValue), estimatedDurationUnit: durationUnit, ...(startDate && { scheduledStartDate: startDate }) }); setExpanded(false); }} disabled={loading} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-60">
          {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Update"}
        </button>
      </div>
    </div>
  );
}

export default UpdateSchedulePanel;

