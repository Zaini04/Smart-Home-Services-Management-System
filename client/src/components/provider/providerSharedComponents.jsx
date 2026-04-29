// src/pages/provider/shared/providerSharedComponents.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  FaCamera, FaCloudUploadAlt, FaCheckCircle,
  FaTimesCircle, FaTrash,
} from "react-icons/fa";
import { buildMediaUrl } from "../../utils/url";

/* ─────────────────────────────────────────
   FILE UPLOAD CARD
   Fix: useEffect only sets preview when file exists (no setPreview(null) in effect)
   Instead, derive preview with useMemo-like pattern
───────────────────────────────────────── */
export const FileUploadCard = ({
  label,
  icon,
  file,
  setFile,
  currentImage = null,
  required = false,
}) => {
  const inputRef               = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  /* 
    FIX: Don't call setPreview(null) inside useEffect.
    Compute preview directly — no extra state needed.
    When file exists → object URL; when currentImage exists → server URL; else null.
  */
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    // Only read file when it exists — no cascade issue
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);

    // Cleanup
    return () => { reader.abort(); };
  }, [file]);

  /*
    Preview priority:
    1. Newly selected file (filePreview)
    2. Existing image from server (currentImage)
    3. Nothing
  */
  const preview = filePreview || (currentImage ? buildMediaUrl(currentImage) : null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith("image/")) setFile(dropped);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    setFilePreview(null);
  };

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300
                  ${isDragging ? "scale-105" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <div className={`relative overflow-hidden rounded-2xl border-2 border-dashed
                       transition-all duration-300 ${
        preview
          ? "border-green-400 bg-green-50"
          : isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
      }`}>
        <div className="aspect-[4/3] flex flex-col items-center justify-center p-4 relative">
          {preview ? (
            <>
              <img
                src={preview}
                alt={label}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                              transition-opacity flex items-center justify-center">
                <div className="text-white text-center">
                  <FaCamera className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">Change Image</span>
                </div>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full
                           opacity-0 group-hover:opacity-100 transition-opacity
                           hover:bg-red-600 z-10"
              >
                <FaTrash className="w-3 h-3" />
              </button>
              {/* Uploaded badge */}
              <div className="absolute bottom-2 left-2 right-2 z-10">
                <span className="bg-green-500 text-white text-xs py-1 px-3 rounded-full
                                 inline-flex items-center gap-1">
                  <FaCheckCircle className="w-3 h-3" />
                  {file ? "New image selected" : "Current image"}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className={`p-4 rounded-full mb-3 transition-colors ${
                isDragging ? "bg-blue-100" : "bg-gray-100"
              }`}>
                {icon || (
                  <FaCloudUploadAlt className={`w-8 h-8 ${
                    isDragging ? "text-blue-500" : "text-gray-400"
                  }`} />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
              <p className="text-xs text-gray-500">Drag & drop or click to upload</p>
              {required && (
                <span className="absolute top-2 right-2 text-red-500 text-xs font-semibold">
                  Required
                </span>
              )}
            </>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files[0]) setFile(e.target.files[0]);
        }}
      />
    </div>
  );
};

/* ── Category Card ── */
export const CategoryCard = ({ category, isSelected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300
                w-full text-left flex items-center gap-3 border-2 ${
      isSelected
        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-md scale-[1.02]"
        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm"
    }`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                     font-bold text-base flex-shrink-0 ${
      isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
    }`}>
      {category.name.charAt(0).toUpperCase()}
    </div>
    <span className="font-medium text-sm flex-1">{category.name}</span>
    {isSelected && (
      <FaCheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
    )}
  </button>
);

/* ── Skill Chip ── */
export const SkillChip = ({ skill, isSelected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                border flex items-center gap-1.5 ${
      isSelected
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md"
        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
    }`}
  >
    {isSelected && <FaCheckCircle className="w-3 h-3" />}
    {skill.name}
  </button>
);

/* ── Form Input ── */
export const FormInput = ({ icon: Icon, label, error, className = "", ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div>
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          {label}
        </label>
      )}
      <input
        {...props}
        onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
        onBlur={(e)  => { setIsFocused(false); props.onBlur?.(e); }}
        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
          error
            ? "border-red-300 bg-red-50 focus:border-red-500"
            : isFocused
            ? "border-blue-500 bg-white shadow-md"
            : "border-gray-200 bg-gray-50 hover:border-gray-300"
        } ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <FaTimesCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
};

/* ── Utility ── */
export const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);
