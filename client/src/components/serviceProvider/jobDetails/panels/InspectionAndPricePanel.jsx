// jobDetails/panels/InspectionAndPricePanel.jsx
import React, { useState } from "react";
import { FaSearch, FaMoneyBillWave, FaExclamationTriangle, FaCalendarAlt, FaSpinner } from "react-icons/fa";
import { calculateCommission } from "../../../../utils/commissionCalc";
import CommissionPreview from "./CommissionPreview";

function InspectionAndPricePanel({ isInspection, onSubmit, loading, walletBalance }) {
  const [laborCost, setLaborCost] = useState("");
  const [scheduledStartDate, setScheduledStartDate] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("hours");
  const [error, setError] = useState("");

  const labor = Number(laborCost) || 0;
  const comm = labor > 0 ? calculateCommission(labor) : null;

  const handleSubmit = () => {
    if (!laborCost || labor <= 0) { setError("Please enter labor cost"); return; }
    if (!scheduledStartDate) { setError("Please select a start date/time"); return; }
    if (!durationValue || Number(durationValue) <= 0) { setError("Please enter estimated duration"); return; }
    if (comm && walletBalance < comm.finalCommission) { setError(`Need Rs. ${comm.finalCommission.toLocaleString()} in wallet`); return; }
    setError("");
    onSubmit({ laborCost: labor, scheduledStartDate, estimatedDurationValue: Number(durationValue), estimatedDurationUnit: durationUnit });
  };

  const accentColor = isInspection ? "blue" : "purple";

  return (
    <div className={`bg-${accentColor}-50 border-2 border-${accentColor}-200 rounded-2xl p-5`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 bg-${accentColor}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
          {isInspection ? <FaSearch className={`text-${accentColor}-600 w-5 h-5`} /> : <FaMoneyBillWave className={`text-${accentColor}-600 w-5 h-5`} />}
        </div>
        <div>
          <h3 className={`font-semibold text-${accentColor}-800`}>{isInspection ? "Complete Inspection & Send Price" : "Send Final Price & Schedule"}</h3>
          <p className={`text-${accentColor}-700 text-sm mt-0.5`}>{isInspection ? "Enter the final price after inspection." : "Send your final price and schedule to the resident."}</p>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-red-700 text-sm flex items-center gap-2"><FaExclamationTriangle />{error}</div>}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost (Rs.) *</label>
          <input type="number" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} placeholder="e.g. 2000" className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm" />
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h4 className="font-medium text-gray-800 text-sm mb-3 flex items-center gap-2"><FaCalendarAlt className="text-blue-600" /> Schedule *</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date & Time</label>
              <input type="datetime-local" value={scheduledStartDate} onChange={(e) => setScheduledStartDate(e.target.value)} min={new Date().toISOString().slice(0, 16)} className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none text-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                <input type="number" value={durationValue} onChange={(e) => setDurationValue(e.target.value)} placeholder="e.g. 3" min="1" className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none text-sm" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button type="button" onClick={() => setDurationUnit("hours")} className={`flex-1 py-2.5 text-sm font-medium transition-all ${durationUnit === "hours" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}>Hours</button>
                  <button type="button" onClick={() => setDurationUnit("days")} className={`flex-1 py-2.5 text-sm font-medium transition-all ${durationUnit === "days" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}>Days</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CommissionPreview laborCost={laborCost} walletBalance={walletBalance} />
      <button onClick={handleSubmit} disabled={loading} className={`w-full py-3 bg-gradient-to-r from-${accentColor}-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60`}>
        {loading ? <FaSpinner className="animate-spin" /> : <FaMoneyBillWave />} Send Price & Schedule
      </button>
    </div>
  );
}

export default InspectionAndPricePanel;

