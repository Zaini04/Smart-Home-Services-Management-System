// pages/admin/SubCategories.jsx
import { useState, useEffect } from "react";
import {
  createSubCategory,
  getCategories,
  updateSubCategory,
  deleteSubCategory,
  getCategoriesWithSkills
} from "../../api/adminEndPoints";
import {
  FaPlus,
  FaSpinner,
  FaCheckCircle,
  FaLayerGroup,
  FaTimes,
  FaEdit,
  FaTrash,
  FaSearch,
  FaExclamationCircle,
  FaChevronDown,
  FaChevronUp,
  FaRedo,
  FaTools,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaExclamationTriangle,
  FaFilter,
} from "react-icons/fa";

/* ------------------ STATUS TOGGLE COMPONENT ------------------ */
const StatusToggle = ({ isActive, onChange }) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => onChange(true)}
      className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2
        ${isActive
          ? "border-green-500 bg-green-50 text-green-700"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
        }`}
    >
      <FaToggleOn className={`w-4 h-4 ${isActive ? "text-green-600" : "text-gray-400"}`} />
      Active
    </button>
    <button
      type="button"
      onClick={() => onChange(false)}
      className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2
        ${!isActive
          ? "border-red-500 bg-red-50 text-red-700"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
        }`}
    >
      <FaToggleOff className={`w-4 h-4 ${!isActive ? "text-red-600" : "text-gray-400"}`} />
      Inactive
    </button>
  </div>
);

/* ------------------ EDIT MODAL ------------------ */
const EditModal = ({ subCategory, parentCategory, onClose, onSave, loading }) => {
  const [form, setForm] = useState({
    name: subCategory?.name || "",
    isActive: subCategory?.isActive !== false,
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Subcategory name is required");
      return;
    }
    onSave(subCategory._id, {
      name: form.name.trim(),
      isActive: form.isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <FaEdit className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Edit Subcategory</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <FaTimes className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <FaExclamationCircle /> {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
            <div className="px-4 py-3 rounded-xl border bg-gray-50 text-gray-600 font-medium">
              {parentCategory?.name || "Unknown"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }));
                setError("");
              }}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <StatusToggle
              isActive={form.isActive}
              onChange={(isActive) => setForm((prev) => ({ ...prev, isActive }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-4 py-3 border-2 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Changes
            </button>
          </div>
        </form>
      </div>
      <style jsx>{` .animate-scaleIn { animation: scaleIn 0.2s ease-out; } @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } `}</style>
    </div>
  );
};

/* ------------------ DELETE MODAL ------------------ */
const DeleteModal = ({ subCategory, parentCategory, onClose, onConfirm, loading }) => (
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
        <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-3 border-2 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 flex items-center justify-center gap-2">
          {loading ? <FaSpinner className="animate-spin" /> : <FaTrash />} Delete
        </button>
      </div>
    </div>
    <style jsx>{` .animate-scaleIn { animation: scaleIn 0.2s ease-out; } @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } `}</style>
  </div>
);

/* ------------------ TOAST ------------------ */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-xl shadow-2xl text-white flex items-center gap-3 animate-slideUp ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

/* ------------------ CATEGORY LIST ITEM ------------------ */
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
  
  // CHECK: Is the parent category itself inactive?
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
              
              {/* SHOW BADGE IF PARENT IS INACTIVE */}
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
          
          {/* WARNING MESSAGE IF PARENT IS INACTIVE */}
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
                      
                      {/* Logic for Subcategory Status Badge */}
                      <div className="flex gap-2 mt-1">
                        {sub.isActive === false && (
                          <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-600">
                            Inactive
                          </span>
                        )}
                        {/* Explicitly say it's hidden if parent is inactive */}
                        {isParentInactive && sub.isActive !== false && (
                          <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-gray-200 text-gray-500">
                            Hidden by Parent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEditSubCategory(sub, category)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg" title="Edit">
                      <FaEdit />
                    </button>
                    <button onClick={() => onDeleteSubCategory(sub, category)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Delete">
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
/* ------------------ MAIN COMPONENT ------------------ */

export default function SubCategories() {
  const [categories, setCategories] = useState([]); 
  const [categoriesWithSkills, setCategoriesWithSkills] = useState([]); 

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [openCategories, setOpenCategories] = useState({});

  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [toast, setToast] = useState(null);

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetchingData(true);
    try {
      // 1. Get Categories (for dropdown)
      const catRes = await getCategories();
      const categoriesData = catRes.data.data || [];
      setCategories(categoriesData);

      // 2. Get Categories with Skills (for list)
      const skillsRes = await getCategoriesWithSkills();
      const skillsData = skillsRes.data.data || [];
      setCategoriesWithSkills(skillsData);

      // Auto-open first category if exists
      if (skillsData.length > 0 && Object.keys(openCategories).length === 0) {
        setOpenCategories({ [skillsData[0]._id]: true });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to fetch data", type: "error" });
    } finally {
      setFetchingData(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCategoryId("");
    setShowForm(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!categoryId || !name.trim()) return;

    setLoading(true);
    try {
      await createSubCategory({ categoryId, name: name.trim() });
      setToast({ message: "Subcategory created!", type: "success" });
      resetForm();
      fetchData();
      setOpenCategories((prev) => ({ ...prev, [categoryId]: true }));
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Error creating", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, data) => {
    setActionLoading(true);
    try {
      await updateSubCategory(id, data);
      setToast({ message: "Subcategory updated!", type: "success" });
      setEditData(null);
      fetchData();
    } catch (err) {
      setToast({ message: "Update failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    setActionLoading(true);
    try {
      await deleteSubCategory(deleteData.subCategory._id);
      setToast({ message: "Subcategory deleted!", type: "success" });
      setDeleteData(null);
      fetchData();
    } catch (err) {
      setToast({ message: "Delete failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // --- FILTERING LOGIC ---
  const filteredCategories = categoriesWithSkills.map((cat) => {
    const originalSubs = cat.subCategories || [];
    
    // Filter Subcategories based on Search AND Status
    const matchingSubs = originalSubs.filter((sub) => {
      const matchesSearch = 
        !searchQuery || 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'active' ? sub.isActive !== false : 
        statusFilter === 'inactive' ? sub.isActive === false : true;

      return matchesSearch && matchesStatus;
    });

    return { ...cat, subCategories: matchingSubs };
  }).filter((cat) => {
    // 1. If we are in 'all' mode, show category even if empty (so we can see empty categories)
    // 2. If we are searching, show category if name matches, even if no subs match
    // 3. If filtering active/inactive, only show if it has matching subs
    
    const hasMatchingSubs = cat.subCategories.length > 0;
    const isSearchMatch = searchQuery && cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isAllFilter = statusFilter === 'all';

    // Show if: Has matching subcategories OR (Filter is All AND (No Search OR Search Matches Name))
    if (hasMatchingSubs) return true;
    if (isAllFilter && (!searchQuery || isSearchMatch)) return true;
    
    return false; 
  });

  const totalSubCategories = categoriesWithSkills.reduce((sum, cat) => sum + (cat.subCategories?.length || 0), 0);
  const activeSubCategories = categoriesWithSkills.reduce(
    (sum, cat) => sum + (cat.subCategories?.filter((sub) => sub.isActive !== false)?.length || 0), 0
  );
  const inactiveSubCategories = totalSubCategories - activeSubCategories;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcategories</h1>
          <p className="text-gray-500 mt-1">Manage skill lists for service providers</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-3 border rounded-xl hover:bg-gray-50 text-gray-600">
            <FaRedo className={fetchingData ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className={`px-5 py-3 rounded-xl font-semibold text-white flex items-center gap-2 shadow-lg transition-all ${
              showForm ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {showForm ? <><FaTimes /> Close</> : <><FaPlus /> Add New</>}
          </button>
        </div>
      </div>

      {!fetchingData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Skills</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalSubCategories}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><FaLayerGroup /></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Skills</p>
              <h3 className="text-2xl font-bold text-green-600">{activeSubCategories}</h3>
            </div>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><FaCheckCircle /></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Inactive Skills</p>
              <h3 className="text-2xl font-bold text-red-600">{inactiveSubCategories}</h3>
            </div>
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center"><FaExclamationTriangle /></div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-scaleIn">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><FaPlus className="w-4 h-4"/></div>
            Create New Subcategory
          </h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-500 appearance-none"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pipe Fitting"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border rounded-xl font-medium">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!fetchingData && (
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="relative flex-1 w-full lg:max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills or categories..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="flex p-1 bg-gray-100 rounded-xl">
            {['all', 'active', 'inactive'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 text-sm font-medium capitalize rounded-lg transition-all ${
                  statusFilter === filter 
                    ? "bg-white text-blue-700 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}

      {fetchingData ? (
        <div className="py-20 text-center">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading skills data...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaFilter className="text-gray-400 text-xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No results found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
          <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); }} className="mt-4 text-blue-600 font-medium hover:underline">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((cat) => (
            <CategoryWithSubcategories
              key={cat._id}
              category={cat}
              isOpen={openCategories[cat._id] || false}
              statusFilter={statusFilter}
              onToggle={() => setOpenCategories(prev => ({ ...prev, [cat._id]: !prev[cat._id] }))}
              onEditSubCategory={(sub) => setEditData({ subCategory: sub, parentCategory: cat })}
              onDeleteSubCategory={(sub) => setDeleteData({ subCategory: sub, parentCategory: cat })}
              onAddSubCategory={(catId) => {
                setCategoryId(catId);
                setShowForm(true);
              }}
            />
          ))}
        </div>
      )}

      {editData && (
        <EditModal
          subCategory={editData.subCategory}
          parentCategory={editData.parentCategory}
          onClose={() => setEditData(null)}
          onSave={handleUpdate}
          loading={actionLoading}
        />
      )}

      {deleteData && (
        <DeleteModal
          subCategory={deleteData.subCategory}
          parentCategory={deleteData.parentCategory}
          onClose={() => setDeleteData(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <style jsx>{`
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}