// pages/admin/Categories.jsx
import { useState, useEffect } from "react";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../../api/adminEndPoints";
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
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaExclamationTriangle,
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

/* ------------------ EDIT MODAL COMPONENT ------------------ */

const EditModal = ({ category, onClose, onSave, loading }) => {
  const [form, setForm] = useState({
    name: category?.name || "",
    description: category?.description || "",
    isActive: category?.isActive !== false,
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }

    onSave(category._id, {
      name: form.name.trim(),
      description: form.description.trim(),
      isActive: form.isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaEdit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Edit Category</h3>
              <p className="text-sm text-gray-500">Update category details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <FaExclamationCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }));
                setError("");
              }}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all"
              placeholder="e.g., Electrician"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
              placeholder="Brief description..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <StatusToggle
              isActive={form.isActive}
              onChange={(isActive) =>
                setForm((prev) => ({ ...prev, isActive }))
              }
            />
            <p className="mt-2 text-xs text-gray-500">
              {form.isActive
                ? "Category is visible and can be used for services"
                : "Category is hidden and cannot be used"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

/* ------------------ DELETE MODAL COMPONENT ------------------ */

const DeleteModal = ({ category, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    />

    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Delete Category?
        </h3>
        <p className="text-gray-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-700">
            "{category?.name}"
          </span>
          ?
        </p>
        <p className="text-sm text-gray-400 mt-2">
          This will deactivate the category. It can be reactivated later.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <FaSpinner className="w-4 h-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <FaTrash className="w-4 h-4" />
              Delete
            </>
          )}
        </button>
      </div>
    </div>

    <style jsx>{`
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      .animate-scaleIn {
        animation: scaleIn 0.2s ease-out;
      }
    `}</style>
  </div>
);

/* ------------------ TOAST NOTIFICATION ------------------ */

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
      >
        {type === "success" ? (
          <FaCheckCircle className="w-5 h-5" />
        ) : (
          <FaExclamationCircle className="w-5 h-5" />
        )}
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-80">
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

/* ------------------ CATEGORY CARD COMPONENT ------------------ */

const CategoryCard = ({ category, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 ${
            category.isActive !== false
              ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25"
              : "bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-500/25"
          }`}
        >
          {category.name?.charAt(0)?.toUpperCase() || "C"}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
              category.isActive !== false
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {category.isActive !== false ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Edit/Delete buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(category)}
          className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors"
          title="Edit Category"
        >
          <FaEdit className="w-4 h-4 text-blue-600" />
        </button>
        <button
          onClick={() => onDelete(category)}
          className="p-2.5 hover:bg-red-50 rounded-xl transition-colors"
          title="Delete Category"
        >
          <FaTrash className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>

    {category.description && (
      <p className="text-gray-600 text-sm line-clamp-2">
        {category.description}
      </p>
    )}

    {category.createdAt && (
      <p className="text-xs text-gray-400 mt-3">
        Created:{" "}
        {new Date(category.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
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
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [editCategory, setEditCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    fetchCategoriesData();
  }, []);

  // Fetch categories from API
  const fetchCategoriesData = async () => {
    setFetchingCategories(true);

    try {
      const res = await getCategories();
      console.log("Categories fetched:", res.data);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      if (err.response?.status !== 404) {
        setToast({ message: "Failed to fetch categories", type: "error" });
      }
      setCategories([]);
    } finally {
      setFetchingCategories(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setDescription("");
    setShowForm(false);
  };

  // Handle create form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setToast({ message: "Category name is required", type: "error" });
      return;
    }

    setLoading(true);

    try {
      await createCategory({
        name: name.trim(),
        description: description.trim(),
      });

      setToast({ message: "Category created successfully!", type: "success" });
      resetForm();
      fetchCategoriesData();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to create category",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit save
  const handleEditSave = async (categoryId, data) => {
    setActionLoading(true);

    try {
      await updateCategory(categoryId, data);
      setToast({ message: "Category updated successfully!", type: "success" });
      setEditCategory(null);
      fetchCategoriesData();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to update category",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setActionLoading(true);

    try {
      await deleteCategory(deleteConfirm._id);
      setToast({ message: "Category deleted successfully!", type: "success" });
      setDeleteConfirm(null);
      fetchCategoriesData();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to delete category",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const activeCount = categories.filter((c) => c.isActive !== false).length;
  const inactiveCount = categories.filter((c) => c.isActive === false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Categories
          </h1>
          <p className="text-gray-500 mt-1">
            Manage service categories for your platform
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
            <FaRedo
              className={`w-4 h-4 ${fetchingCategories ? "animate-spin" : ""}`}
            />
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

      {/* Stats Cards */}
      {!fetchingCategories && categories.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FaTags className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.length}
                </p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FaCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <FaToggleOff className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {inactiveCount}
                </p>
                <p className="text-sm text-gray-500">Inactive</p>
              </div>
            </div>
          </div>
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
              <h2 className="text-lg font-bold text-gray-900">
                Create New Category
              </h2>
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
                  ${
                    loading || !name.trim()
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
        // Empty State
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTags className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No categories yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Get started by creating your first category. Categories help
            organize your services.
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No categories found
          </h3>
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
              onEdit={setEditCategory}
              onDelete={setDeleteConfirm}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editCategory && (
        <EditModal
          category={editCategory}
          onClose={() => setEditCategory(null)}
          onSave={handleEditSave}
          loading={actionLoading}
        />
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <DeleteModal
          category={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
          loading={actionLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}