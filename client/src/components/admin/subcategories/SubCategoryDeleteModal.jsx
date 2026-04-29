import React from "react";
import { FaExclamationTriangle, FaSpinner, FaTrash } from "react-icons/fa";

const SubCategoryDeleteModal = ({ subCategory, parentCategory, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FaExclamationTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Subcategory?</h3>
      <p className="text-gray-500 mb-6">
        Are you sure you want to delete <span className="font-bold text-gray-800">"{subCategory?.name}"</span> from {parentCategory?.name}?
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-3 border-2 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-200"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaTrash />} Delete
        </button>
      </div>
    </div>
  </div>
);

export default SubCategoryDeleteModal;
