// jobDetails/panels/UpdatePendingSchedulePanel.jsx
import React, { useState } from "react";
import { FaCalendarAlt, FaSpinner } from "react-icons/fa";
import { formatSchedule } from "./jobConstants";

function UpdatePendingSchedulePanel({ booking, onSubmit, loading }) {
  const [expanded, setExpanded] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [durationValue, setDurationValue] = useState(booking.schedule?.estimatedDuration?.value?.toString() || "");
  const [durationUnit, setDurationUnit] = useState(booking.schedule?.estimatedDuration?.unit || "hours");

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)} className="w-full py-3 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-blue-100">
        <FaCalendarAlt className="w-4 h-4" /> Change Schedule
      </button>
    );
  }

  const currentSchedule = formatSchedule(booking.schedule);

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
      <h3 className="font-semibold text-blue-800 mb-2">Update Schedule</h3>
      {currentSchedule && (
        <div className="bg-white rounded-lg p-3 mb-3 border border-blue-200">
          <p className="text-xs text-gray-500 mb-1">Current Schedule:</p>
          <p className="text-sm font-medium text-gray-800">{currentSchedule.dateStr} at {currentSchedule.timeStr}</p>
          <p className="text-xs text-gray-600">Duration: {currentSchedule.durStr}</p>
        </div>
      )}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">New Start Date & Time</label>
          <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().slice(0, 16)} className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 outline-none text-sm" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
            <input type="number" value={durationValue} onChange={(e) => setDurationValue(e.target.value)} min="1" placeholder="e.g. 3" className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 outline-none text-sm" />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
            <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
              <button type="button" onClick={() => setDurationUnit("hours")} className={`flex-1 py-2.5 text-sm font-medium ${durationUnit === "hours" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}>Hours</button>
              <button type="button" onClick={() => setDurationUnit("days")} className={`flex-1 py-2.5 text-sm font-medium ${durationUnit === "days" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}>Days</button>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">⚠️ Resident must approve the new schedule</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setExpanded(false)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl bg-white">Cancel</button>
        <button onClick={() => { if (!startDate) { alert("Please select start date & time"); return; } onSubmit({ scheduledStartDate: startDate, estimatedDurationValue: Number(durationValue), estimatedDurationUnit: durationUnit }); setExpanded(false); }} disabled={loading || !startDate || !durationValue} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-60">
          {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Update Schedule"}
        </button>
      </div>
    </div>
  );
}

export default UpdatePendingSchedulePanel;

