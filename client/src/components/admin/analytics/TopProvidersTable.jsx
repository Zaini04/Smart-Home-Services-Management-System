import React from "react";
import { FaTrophy, FaStar } from "react-icons/fa";

const TopProvidersTable = ({ providers }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center shadow-inner">
          <FaTrophy className="text-yellow-600 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Elite Providers (All Time)</h2>
          <p className="text-sm text-gray-500 font-medium">Top performing service providers based on volume and earnings.</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-widest">
              <th className="px-8 py-5">Rank</th>
              <th className="px-8 py-5">Provider Details</th>
              <th className="px-8 py-5 text-center">Jobs</th>
              <th className="px-8 py-5 text-right">Net Earnings</th>
              <th className="px-8 py-5 text-right">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {providers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-center text-gray-400 font-medium italic">No performance data available yet.</td>
              </tr>
            ) : (
              providers.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm
                      ${index === 0 ? 'bg-yellow-400 text-yellow-900 shadow-yellow-200' : 
                        index === 1 ? 'bg-gray-200 text-gray-600' : 
                        index === 2 ? 'bg-orange-200 text-orange-800' : 'bg-blue-50 text-blue-600'}`}
                    >
                      #{index + 1}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={item.image || "https://via.placeholder.com/48"} 
                          alt="" 
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">{item.name}</p>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <span className="text-gray-400">{item.phone}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="flex items-center gap-0.5 text-yellow-600">
                            <FaStar className="w-3 h-3" /> {item.rating}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">{item.jobs}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className="font-black text-emerald-600 text-lg">Rs. {item.totalEarning.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className="font-bold text-blue-600">Rs. {item.totalCommission.toLocaleString()}</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProvidersTable;
