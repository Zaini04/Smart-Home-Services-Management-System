import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getPendingWorkers } from "../../api/adminEndPoints";
import {
  FaSearch,
  FaSpinner,
  FaUserClock,
  FaCheckCircle,
  FaTimes,
  FaExclamationCircle,
  FaRedo,
} from "react-icons/fa";

// Components
import PendingReviewTable from "../../components/admin/workers/PendingReviewTable";

/* ------------------ MAIN COMPONENT ------------------ */

export default function GetPendingWorkers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const { data: workers = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["pendingWorkers"],
    queryFn: async () => {
      try {
        const res = await getPendingWorkers();
        return res.data?.data || [];
      } catch (err) {
        if (err.response?.status === 404) return [];
        setError(err.response?.data?.message || "Failed to fetch pending workers");
        throw err;
      }
    }
  });

  const handleReview = (worker) => {
    navigate(`/admin/update-kyc/${worker._id}`);
  };

  const filteredWorkers = workers.filter((worker) =>
    worker.userId?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.userId?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.cnic?.includes(searchQuery)
  );

  return (
    <div className="space-y-10 pb-20 max-w-[1400px] mx-auto animate-fadeIn">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
              <FaUserClock className="text-white w-6 h-6" />
            </div>
            Review Queue
          </h1>
          <p className="text-gray-500 font-medium mt-2">Evaluate new worker registration requests and KYC documents.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button
            onClick={() => refetch()}
            className="p-4 bg-white border-2 border-gray-50 text-gray-400 rounded-2xl hover:text-blue-600 hover:border-blue-50 transition-all shadow-sm active:scale-95"
          >
            <FaRedo className={isFetching ? "animate-spin" : ""} />
          </button>
          <div className="bg-amber-50 border border-amber-100 px-6 py-3 rounded-2xl">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Pending Review</p>
            <p className="text-xl font-black text-amber-700">{workers.length} Applications</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-5 bg-red-50 text-red-700 rounded-2xl border-2 border-red-100 flex items-center gap-4 animate-shake">
          <FaExclamationCircle className="text-xl flex-shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Search Bar */}
      {!isLoading && workers.length > 0 && (
        <div className="relative max-w-xl group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applicants by name, email or city..."
            className="w-full pl-14 pr-12 py-4 bg-white border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-amber-500 outline-none transition-all font-medium text-gray-700 shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="py-40 flex flex-col items-center justify-center">
          <FaSpinner className="w-12 h-12 text-amber-500 animate-spin mb-6" />
          <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Loading Applications...</p>
        </div>
      ) : workers.length === 0 ? (
        <div className="text-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-400 text-4xl" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Queue is Empty</h3>
          <p className="text-gray-500 font-medium max-w-sm mx-auto">All pending worker registrations have been processed. Great job!</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="text-gray-300 text-xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No matching requests</h3>
          <p className="text-gray-500 mb-4">No applicants match "{searchQuery}"</p>
          <button onClick={() => setSearchQuery("")} className="text-amber-600 font-black uppercase tracking-widest text-[10px] hover:underline">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="animate-slideUp">
          <PendingReviewTable workers={filteredWorkers} onReview={handleReview} />
        </div>
      )}

      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}