import { useState, useEffect } from "react";
import { createSubCategory, getCategories } from "../../api/adminEndPoints";
import { getCategoriesWithSkills } from "../../api/serviceProviderEndPoints";
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
  FaTags,
} from "react-icons/fa";

/* ------------------ CATEGORY WITH SUBCATEGORIES CARD ------------------ */

const CategoryWithSubcategories = ({ 
  category, 
  isOpen, 
  onToggle, 
  onEditSubCategory, 
  onDeleteSubCategory 
}) => {
  const subCategories = category.subCategories || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Category Header - Clickable */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/25">
            {category.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
            <p className="text-sm text-gray-500">
              {subCategories.length} {subCategories.length === 1 ? 'subcategory' : 'subcategories'}
            </p>
          </div>
        </div>
        <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-blue-100' : 'bg-gray-100'}`}>
          {isOpen ? (
            <FaChevronUp className="w-4 h-4 text-blue-600" />
          ) : (
            <FaChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Subcategories List */}
      {isOpen && (
        <div className="border-t border-gray-100">
          {subCategories.length === 0 ? (
            // No subcategories for this category
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaLayerGroup className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No subcategories yet</p>
              <p className="text-gray-400 text-xs mt-1">Add subcategories to this category</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {subCategories.map((sub) => (
                <div
                  key={sub._id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <FaTools className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{sub.name}</span>
                  </div>
                  {/* Edit/Delete buttons - will be enabled when APIs are ready */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditSubCategory(sub, category)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit (Coming Soon)"
                      disabled
                    >
                      <FaEdit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => onDeleteSubCategory(sub._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete (Coming Soon)"
                      disabled
                    >
                      <FaTrash className="w-4 h-4 text-gray-400" />
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

/* ------------------ SKELETON LOADER ------------------ */

const CategorySkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-200" />
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
    </div>
  </div>
);

/* ------------------ MAIN COMPONENT ------------------ */

export default function CreateSubCategory() {
  // Data state
  const [categories, setCategories] = useState([]); // For dropdown
  const [categoriesWithSkills, setCategoriesWithSkills] = useState([]); // For display
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState({});

  // Form state
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch all data from APIs
  const fetchData = async () => {
    setFetchingData(true);
    setError("");

    try {
      // Fetch categories for dropdown
      const catRes = await getCategories();
      const categoriesData = catRes.data.data || [];
      setCategories(categoriesData);

      // Fetch categories with subcategories for display
      const skillsRes = await getCategoriesWithSkills();
      const categoriesWithSkillsData = skillsRes.data.data || [];
      setCategoriesWithSkills(categoriesWithSkillsData);
      
      // Auto-open first category if exists
      if (categoriesWithSkillsData.length > 0) {
        setOpenCategories({ [categoriesWithSkillsData[0]._id]: true });
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      if (err.response?.status === 404) {
        // No data found - this is okay
        setCategories([]);
        setCategoriesWithSkills([]);
      } else {
        setError(err.response?.data?.message || "Failed to fetch data");
      }
    } finally {
      setFetchingData(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setCategoryId("");
    setShowForm(false);
    setError("");
  };

  // Toggle category accordion
  const toggleCategory = (catId) => {
    setOpenCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Expand all categories
  const expandAll = () => {
    const allOpen = {};
    categoriesWithSkills.forEach(cat => {
      allOpen[cat._id] = true;
    });
    setOpenCategories(allOpen);
  };

  // Collapse all categories
  const collapseAll = () => {
    setOpenCategories({});
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryId) {
      setError("Please select a parent category");
      return;
    }

    if (!name.trim()) {
      setError("Subcategory name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createSubCategory({ 
        categoryId, 
        name: name.trim() 
      });

      setSuccess("Subcategory created successfully!");
      resetForm();
      fetchData(); // Refresh the list
      
      // Auto-open the category where subcategory was added
      setOpenCategories(prev => ({ ...prev, [categoryId]: true }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create subcategory");
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for future edit functionality
  const handleEditSubCategory = (subCategory, parentCategory) => {
    alert("Edit functionality will be available soon!");
  };

  // Placeholder for future delete functionality
  const handleDeleteSubCategory = (id) => {
    alert("Delete functionality will be available soon!");
  };

  // Filter categories based on search
  const filteredCategories = searchQuery
    ? categoriesWithSkills.filter(cat => 
        cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.subCategories?.some(sub => 
          sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : categoriesWithSkills;

  // Calculate totals
  const totalSubCategories = categoriesWithSkills.reduce(
    (sum, cat) => sum + (cat.subCategories?.length || 0), 
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Subcategories</h1>
          <p className="text-gray-500 mt-1">
            Manage subcategories (skills) under each service category
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={fetchingData}
            className="p-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <FaRedo className={`w-4 h-4 ${fetchingData ? 'animate-spin' : ''}`} />
          </button>

          {/* Add Subcategory Button */}
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            disabled={categories.length === 0}
            className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all shadow-lg ${
              categories.length === 0
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-xl"
            }`}
          >
            {showForm ? (
              <>
                <FaTimes className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <FaPlus className="w-4 h-4" />
                Add Subcategory
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {!fetchingData && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaTags className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{categoriesWithSkills.length}</p>
              <p className="text-sm text-gray-500">Categories</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FaLayerGroup className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalSubCategories}</p>
              <p className="text-sm text-gray-500">Subcategories</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 col-span-2 sm:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FaTools className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {categoriesWithSkills.length > 0 
                  ? Math.round(totalSubCategories / categoriesWithSkills.length) 
                  : 0}
              </p>
              <p className="text-sm text-gray-500">Avg per Category</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <FaCheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-green-700 font-medium flex-1">{success}</p>
          <button onClick={() => setSuccess("")}>
            <FaTimes className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <FaExclamationCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-red-700 font-medium flex-1">{error}</p>
          <button onClick={() => setError("")}>
            <FaTimes className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <FaLayerGroup className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create New Subcategory</h2>
              <p className="text-sm text-gray-500">Add a new subcategory to a category</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Parent Category Dropdown - Shows real categories from API */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
              </div>

              {/* Subcategory Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Fan Repair, Pipe Fitting"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || !categoryId}
                className={`
                  px-8 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all
                  ${loading || !name.trim() || !categoryId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
                  }
                `}
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-5 h-5" />
                    Create Subcategory
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Controls */}
      {!fetchingData && categoriesWithSkills.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories or subcategories..."
              className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Expand/Collapse Buttons */}
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      )}

      {/* Categories with Subcategories List */}
      {fetchingData ? (
        // Loading State
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        // No categories exist - need to create category first
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTags className="w-10 h-10 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You need to create categories first before adding subcategories. 
            Go to the Categories page to create one.
          </p>
          <a
            href="/admin/create-category"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg shadow-blue-500/25"
          >
            <FaPlus className="w-4 h-4" />
            Create Category First
          </a>
        </div>
      ) : filteredCategories.length === 0 ? (
        // No search results
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 mb-4">
            No categories or subcategories match "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            Clear search
          </button>
        </div>
      ) : (
        // Categories with Subcategories
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <CategoryWithSubcategories
              key={category._id}
              category={category}
              isOpen={openCategories[category._id] || false}
              onToggle={() => toggleCategory(category._id)}
              onEditSubCategory={handleEditSubCategory}
              onDeleteSubCategory={handleDeleteSubCategory}
            />
          ))}
        </div>
      )}

      {/* Note about Edit/Delete */}
      {!fetchingData && categoriesWithSkills.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <FaExclamationCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">Note</p>
            <p className="text-sm text-amber-700">
              Edit and delete functionality for categories and subcategories will be available once the APIs are implemented.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}