import React from "react";
import { FaLightbulb } from "react-icons/fa";

const AiInsights = ({ insights }) => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
      
      <div className="relative z-10">
        <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <FaLightbulb className="text-yellow-300 animate-pulse" />
          </div>
          Platform Intelligence
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-white text-sm font-bold shadow-lg flex items-start gap-3 hover:bg-white/20 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-1.5 flex-shrink-0"></span>
              <p className="leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiInsights;
