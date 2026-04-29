// pages/admin/SubCategories.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  FaTimes,
  FaSearch,
  FaExclamationCircle,
  FaRedo,
  FaFilter,
} from "react-icons/fa";

// Components
import SubCategoryStats from "../../components/admin/subcategories/SubCategoryStats";
import SubCategoryForm from "../../components/admin/subcategories/SubCategoryForm";
import CategoryWithSubcategories from "../../components/admin/subcategories/CategoryWithSubcategories";
import SubCategoryEditModal from "../../components/admin/subcategories/SubCategoryEditModal";
import SubCategoryDeleteModal from "../../components/admin/subcategories/SubCategoryDeleteModal";

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

/* ------------------ MAIN COMPONENT ------------------ */

export default function CreateSubCategories() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [openCategories, setOpenCategories] = useState({});

  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [toast, setToast] = useState(null);

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");

  // Queries
  const { data: categories = [] } = useQuery({
    queryKey: ["adminCategoriesForDropdown"],
    queryFn: async () => {
      const res = await getCategories();
      return res.data?.data || [];
    }
  });

  const { data: categoriesWithSkills = [], isLoading: fetchingData, isFetching } = useQuery({
    queryKey: ["adminSubCategories"],
    queryFn: async () => {
      const res = await getCategoriesWithSkills();
      const skillsData = res.data?.data || [];
      if (skillsData.length > 0 && Object.keys(openCategories).length === 0) {
        setOpenCategories({ [skillsData[0]._id]: true });
      }
      return skillsData;
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createSubCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminSubCategories"]);
      setToast({ message: "Subcategory created!", type: "success" });
      resetForm();
      setOpenCategories((prev) => ({ ...prev, [categoryId]: true }));
    },
    onError: (err) => {
      setToast({ message: err.response?.data?.message || "Error creating", type: "error" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSubCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminSubCategories"]);
      setToast({ message: "Subcategory updated!", type: "success" });
      setEditData(null);
    },
    onError: () => setToast({ message: "Update failed", type: "error" })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminSubCategories"]);
      setToast({ message: "Subcategory deleted!", type: "success" });
      setDeleteData(null);
    },
    onError: () => setToast({ message: "Delete failed", type: "error" })
  });

  const resetForm = () => {
    setName("");
    setCategoryId("");
    setShowForm(false);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!categoryId || !name.trim()) return;
    createMutation.mutate({ categoryId, name: name.trim() });
  };

  const handleUpdate = (id, data) => updateMutation.mutate({ id, data });
  const handleDelete = () => deleteData && deleteMutation.mutate(deleteData.subCategory._id);

  // Filtering Logic
  const filteredCategories = categoriesWithSkills.map((cat) => {
    const originalSubs = cat.subCategories || [];
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
    const hasMatchingSubs = cat.subCategories.length > 0;
    const isSearchMatch = searchQuery && cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isAllFilter = statusFilter === 'all';
    if (hasMatchingSubs) return true;
    if (isAllFilter && (!searchQuery || isSearchMatch)) return true;
    return false; 
  });

  const stats = {
    total: categoriesWithSkills.reduce((sum, cat) => sum + (cat.subCategories?.length || 0), 0),
    active: categoriesWithSkills.reduce((sum, cat) => sum + (cat.subCategories?.filter((sub) => sub.isActive !== false)?.length || 0), 0),
    inactive: 0
  };
  stats.inactive = stats.total - stats.active;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcategories</h1>
          <p className="text-gray-500 mt-1">Manage skill lists for service providers</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { queryClient.invalidateQueries(["adminSubCategories"]); queryClient.invalidateQueries(["adminCategoriesForDropdown"]); }} className="p-3 border rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
            <FaRedo className={isFetching ? "animate-spin" : ""} />
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

      {!fetchingData && <SubCategoryStats {...stats} />}

      {showForm && (
        <SubCategoryForm
          onSubmit={handleCreate}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          categories={categories}
          name={name}
          setName={setName}
          isPending={createMutation.isPending}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!fetchingData && (
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-2xl border border-gray-100">
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
        <SubCategoryEditModal
          subCategory={editData.subCategory}
          parentCategory={editData.parentCategory}
          onClose={() => setEditData(null)}
          onSave={handleUpdate}
          loading={updateMutation.isPending}
        />
      )}

      {deleteData && (
        <SubCategoryDeleteModal
          subCategory={deleteData.subCategory}
          parentCategory={deleteData.parentCategory}
          onClose={() => setDeleteData(null)}
          onConfirm={handleDelete}
          loading={deleteMutation.isPending}
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