import React from "react";
import { FaChevronUp, FaChevronDown, FaPlus, FaLayerGroup, FaTools, FaEdit, FaTrash, FaExclamationTriangle } from "react-icons/fa";

const CategoryWithSubcategories = ({
  category,
  isOpen,
  onToggle,
  onEditSubCategory,
  onDeleteSubCategory,
  statusFilter,
  onAddSubCategory
}) => {
  const subCategories = category.subCategories || [];
  const isParentInactive = category.isActive === false;

  return (
    <div className={`
      rounded-2xl shadow-sm border overflow-hidden transition-all duration-300
      ${subCategories.length === 0 ? 'border-amber-200' : 'border-gray-100'}
      ${isParentInactive ? 'bg-gray-50 border-gray-200' : 'bg-white hover:shadow-md'}
    `}>
      <button
        onClick={onToggle}
        className={`w-full px-6 py-5 flex items-center justify-between transition-colors
          ${isParentInactive 
            ? 'bg-gray-100 cursor-pointer' 
            : 'bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100'}
        `}
      >
        <div className="flex items-center gap-4">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm
            ${isParentInactive 
              ? 'bg-gray-300 text-gray-500' 
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/25'}
          `}>
            {category.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-lg ${isParentInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                {category.name}
              </h3>
              {isParentInactive && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 border border-red-200">
                  Parent Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {subCategories.length} {statusFilter !== "all" ? statusFilter : ""} subcategories found
            </p>
          </div>
        </div>

        <div className={`p-2 rounded-lg transition-colors ${isOpen ? "bg-blue-100" : "bg-gray-200"}`}>
          {isOpen ? <FaChevronUp className="text-blue-600" /> : <FaChevronDown className="text-gray-500" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100">
          {isParentInactive && (
            <div className="bg-red-50 px-6 py-3 text-xs text-red-700 flex items-center gap-2 border-b border-red-100">
              <FaExclamationTriangle />
              <span>
                <strong>Note:</strong> This category is Inactive. All subcategories below are currently hidden from the user app.
              </span>
            </div>
          )}

          {subCategories.length === 0 ? (
            <div className="p-8 text-center bg-gray-50">
              <FaLayerGroup className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm mb-4">No subcategories found.</p>
              {statusFilter === 'all' && (
                <button 
                  onClick={() => onAddSubCategory(category._id)}
                  className="text-sm text-blue-600 font-semibold hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <FaPlus className="w-3 h-3"/> Add one now
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {subCategories.map((sub) => (
                <div key={sub._id} className={`flex items-center justify-between px-6 py-4 transition-colors group ${isParentInactive ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center 
                      ${isParentInactive ? 'bg-gray-200 text-gray-400' : 
                        sub.isActive !== false ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"}
                    `}>
                      <FaTools className="w-4 h-4" />
                    </div>
                    <div>
                      <span className={`font-medium block ${isParentInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                        {sub.name}
                      </span>
                      <div className="flex gap-2 mt-1">
                        {sub.isActive === false && (
                          <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-600">
                            Inactive
                          </span>
                        )}
                        {isParentInactive && sub.isActive !== false && (
                          <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-gray-200 text-gray-500">
                            Hidden by Parent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEditSubCategory(sub)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg" title="Edit">
                      <FaEdit />
                    </button>
                    <button onClick={() => onDeleteSubCategory(sub)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryWithSubcategories;
