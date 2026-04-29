// jobDetails/panels/PriceRevisionPanel.jsx
import React, { useState } from "react";
import { FaEdit, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import CommissionPreview from "./CommissionPreview";

function PriceRevisionPanel({ booking, onSubmit, loading, walletBalance }) {
  const [expanded, setExpanded] = useState(false);
  const [laborCost, setLaborCost] = useState(booking.finalPrice?.laborCost?.toString() || "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)} className="w-full py-3 bg-orange-50 border-2 border-orange-200 text-orange-700 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-orange-100">
        <FaEdit className="w-4 h-4" /> Update Price
      </button>
    );
  }

  const handleSubmit = () => {
    if (!laborCost || Number(laborCost) <= 0) { setError("Enter labor cost"); return; }
    setError("");
    onSubmit({ laborCost: Number(laborCost), reason });
    setExpanded(false);
  };

  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
      <h3 className="font-semibold text-orange-800 mb-4">Update Price</h3>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-red-700 text-sm"><FaExclamationTriangle className="inline mr-2" />{error}</div>}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Labor Cost</label>
          <input type="number" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 outline-none text-sm resize-none" />
        </div>
      </div>
      <CommissionPreview laborCost={laborCost} walletBalance={walletBalance} />
      <div className="flex gap-3">
        <button onClick={() => setExpanded(false)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl bg-white">Cancel</button>
        <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold disabled:opacity-60">
          {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default PriceRevisionPanel;

