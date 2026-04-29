import React from "react";
import { FaTrash, FaSpinner } from "react-icons/fa";
import { buildMediaUrl } from "../../../utils/url";

const SlideCard = ({ slide, onDelete, deleting }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-6 p-5 bg-white border border-gray-100 rounded-3xl hover:shadow-xl hover:border-blue-100 transition-all group">
      <div className="w-full sm:w-48 aspect-[16/9] rounded-2xl overflow-hidden bg-gray-200 shadow-inner flex-shrink-0">
        <img 
          src={buildMediaUrl(slide.image)} 
          alt={slide.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <h4 className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-600 transition-colors">{slide.title}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase">Order: {slide.order}</span>
              <span className="text-[10px] text-gray-300 font-mono">{slide._id.slice(-6)}</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this slide?")) {
                onDelete(slide._id);
              }
            }}
            disabled={deleting}
            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
            title="Delete Slide"
          >
            {deleting ? <FaSpinner className="animate-spin w-4 h-4" /> : <FaTrash className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-100">
            <span className="opacity-70">Action:</span>
            <span>{slide.ctaText}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 text-xs font-bold rounded-xl border border-gray-100 font-mono">
            <span className="opacity-70">URL:</span>
            <span>{slide.ctaLink}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideCard;
