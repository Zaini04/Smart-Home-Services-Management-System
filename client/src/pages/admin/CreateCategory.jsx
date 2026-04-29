// pages/admin/Categories.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  FaTimes,
  FaSearch,
  FaExclamationCircle,
  FaRedo,
} from "react-icons/fa";

// Components
import CategoryStats from "../../components/admin/categories/CategoryStats";
import CategoryForm from "../../components/admin/categories/CategoryForm";
import CategoryCard from "../../components/admin/categories/CategoryCard";
import CategoryEditModal from "../../components/admin/categories/CategoryEditModal";
import CategoryDeleteModal from "../../components/admin/categories/CategoryDeleteModal";

/* ------------------ TOAST COMPONENT ------------------ */

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-xl shadow-2xl text-white flex items-center gap-3 animate-slideUp
      ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function CreateCategory() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Modal States
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [toast, setToast] = useState(null);

  // Queries
  const { data: categories = [], isLoading, isFetching } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: async () => {
      const res = await getCategories();
      return res.data.data;
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminCategories"]);
      setToast({ message: "Category created successfully!", type: "success" });
      resetForm();
      setShowForm(false);
    },
    onError: (error) => {
      setToast({
        message: error.response?.data?.message || "Error creating category",
        type: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminCategories"]);
      setToast({ message: "Category updated successfully!", type: "success" });
      setEditData(null);
    },
    onError: () => {
      setToast({ message: "Failed to update category", type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminCategories"]);
      setToast({ message: "Category deleted successfully!", type: "success" });
      setDeleteData(null);
    },
    onError: () => {
      setToast({ message: "Failed to delete category", type: "error" });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ name, description });
  };

  const handleEditSave = (data) => {
    updateMutation.mutate({ id: editData._id, data });
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(deleteData._id);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.isActive !== false).length,
    inactive: categories.filter((c) => c.isActive === false).length,
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Manage platform service categories</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => queryClient.invalidateQueries(["adminCategories"])}
            className="p-3 border rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <FaRedo className={isFetching ? "animate-spin" : ""} />
          </button>
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
      {!isLoading && categories.length > 0 && (
        <CategoryStats 
          total={stats.total}
          active={stats.active}
          inactive={stats.inactive}
        />
      )}

      {/* Create Form */}
      {showForm && (
        <CategoryForm 
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Search Bar */}
      {!isLoading && categories.length > 0 && (
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
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-6">Start by adding your first service category.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl"
          >
            <FaPlus /> Create First Category
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">No categories found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              onEdit={setEditData}
              onDelete={setDeleteData}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {editData && (
        <CategoryEditModal
          category={editData}
          onClose={() => setEditData(null)}
          onSave={handleEditSave}
          isLoading={updateMutation.isPending}
        />
      )}

      {deleteData && (
        <CategoryDeleteModal
          category={deleteData}
          onClose={() => setDeleteData(null)}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteMutation.isPending}
        />
      )}

      {/* Toast Notification */}
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