import React from "react";
import { FaTags, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const CategoryStats = ({ total, active, inactive }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Total Categories</p>
          <h3 className="text-2xl font-bold text-gray-900">{total}</h3>
        </div>
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
          <FaTags />
        </div>
      </div>
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Active Categories</p>
          <h3 className="text-2xl font-bold text-green-600">{active}</h3>
        </div>
        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
          <FaCheckCircle />
        </div>
      </div>
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Inactive Categories</p>
          <h3 className="text-2xl font-bold text-red-600">{inactive}</h3>
        </div>
        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
          <FaExclamationTriangle />
        </div>
      </div>
    </div>
  );
};

export default CategoryStats;
