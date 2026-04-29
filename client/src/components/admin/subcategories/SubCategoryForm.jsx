import React from "react";
import { FaPlus, FaChevronDown, FaTimes } from "react-icons/fa";

const SubCategoryForm = ({ 
  onSubmit, 
  categoryId, 
  setCategoryId, 
  categories, 
  name, 
  setName, 
  isPending, 
  onCancel 
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-scaleIn">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
          <FaPlus className="w-4 h-4" />
        </div>
        Create New Subcategory
      </h2>
      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-500 appearance-none outline-none transition-all"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Pipe Fitting"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-all"
            required
          />
        </div>
        <div className="sm:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border-2 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
          >
            {isPending ? "Creating..." : "Create Subcategory"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubCategoryForm;
