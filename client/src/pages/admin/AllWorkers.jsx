import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllWorkers } from "../../api/adminEndPoints";
import {
  FaSearch,
  FaSpinner,
  FaFilter,
  FaRedo,
  FaExclamationCircle,
  FaTimes,
  FaUser,
} from "react-icons/fa";

// Components
import WorkerListTable from "../../components/admin/workers/WorkerListTable";

/* ------------------ MAIN COMPONENT ------------------ */

export default function AllWorkers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, approved, pending, rejected
  const [error, setError] = useState("");

  const { data: workers = [], isLoading: loading, isFetching, refetch } = useQuery({
    queryKey: ["allWorkers"],
    queryFn: async () => {
      try {
        const res = await getAllWorkers();
        return res.data?.data || [];
      } catch (err) {
        if (err.response?.status === 404) return [];
        setError("Failed to load providers.");
        throw err;
      }
    }
  });

  // Filter Logic
  const filteredWorkers = workers.filter((worker) => {
    const user = worker.userId || {};
    
    const matchesSearch = 
      (user.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.phone || "").includes(searchQuery) ||
      (worker.serviceCategories || []).some(cat => 
        (typeof cat === 'string' ? cat : cat.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = statusFilter === "all" ? true : worker.kycStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const total = workers.length;
  const approved = workers.filter(w => w.kycStatus === 'approved').length;

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Service Providers</h1>
          <p className="text-gray-500 font-medium mt-1">Full database of all registered platform workers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-3.5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-95"
            title="Refresh Database"
          >
            <FaRedo className={isFetching ? "animate-spin" : ""} />
          </button>
          <div className="px-5 py-2.5 bg-blue-600 text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-blue-500/25">
             {total} Profiles / {approved} Verified
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
        <div className="relative flex-1 w-full xl:max-w-xl group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, city or skill..."
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-gray-700"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          )}
        </div>

        <div className="flex p-1.5 bg-gray-100 rounded-2xl w-full xl:w-auto overflow-x-auto no-scrollbar">
          {['all', 'approved', 'pending', 'rejected'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap flex-1 xl:flex-none ${
                statusFilter === filter 
                  ? 'bg-white text-blue-600 shadow-md scale-100' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-5 bg-red-50 text-red-700 rounded-2xl flex items-center gap-4 border-2 border-red-100 animate-shake">
          <FaExclamationCircle className="text-xl" /> 
          <p className="font-bold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center">
          <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mb-6" />
          <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Accessing Records...</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUser className="text-gray-300 text-4xl" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No Providers Found</h3>
          <p className="text-gray-500 font-medium max-w-sm mx-auto">There are no service providers matching your current criteria in the database.</p>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <WorkerListTable workers={filteredWorkers} />
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}