import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const CategoryCard = ({ category, onEdit, onDelete }) => {
  const isInactive = category.isActive === false;

  return (
    <div className={`group bg-white rounded-2xl p-6 border-2 transition-all duration-300 ${
      isInactive ? "border-red-100 bg-gray-50" : "border-gray-100 hover:border-blue-200 hover:shadow-xl"
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-110 ${
          isInactive ? "bg-gray-200 text-gray-500" : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
        }`}>
          {category.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(category)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Edit Category"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Delete Category"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className={`font-bold text-lg mb-1 ${isInactive ? "text-gray-500" : "text-gray-900"}`}>
        {category.name}
      </h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
        {category.description || "No description provided."}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          isInactive ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
        }`}>
          {isInactive ? "Inactive" : "Active"}
        </span>
        <span className="text-xs text-gray-400 font-medium">
          ID: {category._id.slice(-6)}
        </span>
      </div>
    </div>
  );
};

export default CategoryCard;
