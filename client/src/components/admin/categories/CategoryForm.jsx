import React from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";

const CategoryForm = ({ onSubmit, name, setName, description, setDescription, isPending, onCancel }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-scaleIn">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
          <FaPlus className="w-4 h-4" />
        </div>
        Create New Category
      </h2>
      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Plumbing"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-all"
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
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
          >
            {isPending ? (
              <>
                <FaSpinner className="animate-spin" /> Creating...
              </>
            ) : (
              "Create Category"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
