import React from "react";
import { FaTimes } from "react-icons/fa";

const KycImageModal = ({ src, alt, onClose }) => {
  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-fadeIn" 
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110 active:scale-95"
      >
        <FaTimes className="w-6 h-6 text-white" />
      </button>
      <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain animate-scaleIn"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
          }}
        />
      </div>
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default KycImageModal;
