import React, { useState } from "react";
import { FaUser, FaExpand, FaExclamationCircle } from "react-icons/fa";
import { formatImagePath } from "../../../utils/formatPath";

const KycDocumentCard = ({ label, imagePath, onView }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = formatImagePath(imagePath);

  if (!imagePath) {
    return (
      <div className="relative">
        <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
          <div className="text-center">
            <FaUser className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No image uploaded</p>
          </div>
        </div>
        <p className="mt-2 text-sm font-semibold text-gray-700 text-center uppercase tracking-wide">{label}</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm transition-all group-hover:shadow-md">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-red-400 bg-red-50">
            <FaExclamationCircle className="w-8 h-8 mb-2" />
            <p className="text-xs font-medium">Failed to load image</p>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onView(imageUrl, label)}
            className="p-3 bg-white rounded-full text-gray-900 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <FaExpand className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-gray-700 text-center uppercase tracking-wide flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        {label}
      </p>
    </div>
  );
};

export default KycDocumentCard;
