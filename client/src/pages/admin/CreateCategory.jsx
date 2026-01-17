import { useState, useEffect } from "react";
import { createCategory, getCategories } from "../../api/adminEndPoints";
import {
  FaPlus,
  FaSpinner,
  FaCheckCircle,
  FaTags,
  FaTimes,
  FaEdit,
  FaTrash,
  FaSearch,
  FaExclamationCircle,
  FaRedo,
} from "react-icons/fa";

/* ------------------ CATEGORY CARD COMPONENT ------------------ */

const CategoryCard = ({ category, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
          {category.name?.charAt(0)?.toUpperCase() || "C"}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
          {category.isActive !== undefined && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
              category.isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>
      </div>
      {/* Edit/Delete buttons - will be enabled when APIs are ready */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(category)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Edit (Coming Soon)"
          disabled
        >
          <FaEdit className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={() => onDelete(category._id)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete (Coming Soon)"
          disabled
        >
          <FaTrash className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
    {category.description && (
      <p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
    )}
    {category.createdAt && (
      <p className="text-xs text-gray-400 mt-3">
        Created: {new Date(category.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </p>
    )}
  </div>
);

/* ------------------ SKELETON LOADER ------------------ */

const CategorySkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-14 h-14 rounded-2xl bg-gray-200" />
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full" />
  </div>
);

/* ------------------ MAIN COMPONENT ------------------ */

export default function CreateCategory() {
  // Data state
  const [categories, setCategories] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    fetchCategoriesData();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch categories from API
  const fetchCategoriesData = async () => {
    setFetchingCategories(true);
    setError("");
    
    try {
      const res = await getCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      if (err.response?.status === 404) {
        // No categories found - this is okay
        setCategories([]);
      } else {
        setError(err.response?.data?.message || "Failed to fetch categories");
      }
    } finally {
      setFetchingCategories(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setDescription("");
    setShowForm(false);
    setError("");
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createCategory({ 
        name: name.trim(), 
        description: description.trim() 
      });

      setSuccess("Category created successfully!");
      resetForm();
      fetchCategoriesData(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for future edit functionality
  const handleEdit = (category) => {
    alert("Edit functionality will be available soon!");
  };

  // Placeholder for future delete functionality
  const handleDelete = (id) => {
    alert("Delete functionality will be available soon!");
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">
            Manage service categories for your platform
            {!fetchingCategories && categories.length > 0 && (
              <span className="text-blue-600 font-medium"> ({categories.length} total)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={fetchCategoriesData}
            disabled={fetchingCategories}
            className="p-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <FaRedo className={`w-4 h-4 ${fetchingCategories ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Add Category Button */}
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl"
          >
            {showForm ? (
              <>
                <FaTimes className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <FaPlus className="w-4 h-4" />
                Add Category
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <FaCheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-green-700 font-medium flex-1">{success}</p>
          <button onClick={() => setSuccess("")} className="text-green-600 hover:text-green-800">
            <FaTimes className="w-4 h-4" />
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
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaTags className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create New Category</h2>
              <p className="text-sm text-gray-500">Add a new service category</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Electrician"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the category"
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
                disabled={loading || !name.trim()}
                className={`
                  px-8 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all
                  ${loading || !name.trim()
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
                    Create Category
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      {!fetchingCategories && categories.length > 0 && (
        <div className="relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
      )}

      {/* Categories Grid */}
      {fetchingCategories ? (
        // Loading State
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        // Empty State - No categories at all
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTags className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Get started by creating your first category. Categories help organize your services.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg shadow-blue-500/25"
          >
            <FaPlus className="w-4 h-4" />
            Create Your First Category
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        // No search results
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-4">
            No categories match "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            Clear search
          </button>
        </div>
      ) : (
        // Categories Grid
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}