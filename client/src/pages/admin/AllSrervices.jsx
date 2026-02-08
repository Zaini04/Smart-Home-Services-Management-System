// pages/admin/AllServices.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllServices,
  updateService,
  deleteService,
  getCategories,
} from "../../api/adminEndPoints";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaImage,
  FaTag,
  FaAlignLeft,
  FaDollarSign,
  FaPercent,
  FaList,
  FaSave,
  FaFilter,
  FaCloudUploadAlt,
  FaEllipsisV,
  FaArrowLeft,
  FaBoxOpen,
  FaToggleOn,
  FaToggleOff,
  FaExclamationTriangle,
  FaRedo,
} from "react-icons/fa";

/* ------------------ CONFIG ------------------ */
const BASE_URL = "http://localhost:5000";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

/* ------------------ HELPER FUNCTIONS ------------------ */

// Get category info from service (handles populated category)
const getCategoryInfo = (service) => {
  const category = service?.category;
  
  if (!category) {
    return { id: "", name: "Uncategorized" };
  }
  
  // If category is populated (object with _id and name)
  if (typeof category === "object" && category._id) {
    return { 
      id: category._id.toString(), 
      name: category.name || "Uncategorized" 
    };
  }
  
  // If category is just a string ID (not populated)
  if (typeof category === "string") {
    return { id: category, name: "Loading..." };
  }
  
  return { id: "", name: "Uncategorized" };
};

/* ------------------ COMPONENTS ------------------ */

const StatusBadge = ({ status }) => {
  const isActive = status === "active" || !status;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
      ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

const DiscountBadge = ({ percentage }) => {
  if (!percentage || percentage === 0) return null;
  return (
    <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg z-10">
      {percentage}% OFF
    </span>
  );
};

/* ------------------ SERVICE CARD ------------------ */

const ServiceCard = ({ service, onEdit, onDelete, onToggleStatus }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef(null);

  const imageUrl = getImageUrl(service.image?.url);
  const categoryInfo = getCategoryInfo(service);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <FaImage className="w-12 h-12 text-gray-300 mb-2" />
            <span className="text-xs text-gray-400">No image</span>
          </div>
        )}
        <DiscountBadge percentage={service.discount?.percentage} />

        {/* Menu */}
        <div className="absolute top-3 right-3 z-20" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-colors"
          >
            <FaEllipsisV className="w-4 h-4 text-gray-600" />
          </button>

          {showMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-30">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(service); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <FaEdit className="w-4 h-4 text-blue-500" />
                Edit Service
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleStatus(service); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                {service.status === "active" || !service.status ? (
                  <><FaToggleOff className="w-4 h-4 text-orange-500" /> Deactivate</>
                ) : (
                  <><FaToggleOn className="w-4 h-4 text-green-500" /> Activate</>
                )}
              </button>
              <hr className="my-2" />
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(service); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3"
              >
                <FaTrash className="w-4 h-4" />
                Delete Service
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-gray-900 line-clamp-1 flex-1">{service.title}</h3>
          <StatusBadge status={service.status} />
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{service.description}</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-gray-900">
              PKR {(service.finalPrice || service.price)?.toLocaleString()}
            </p>
            {service.discount?.percentage > 0 && (
              <p className="text-sm text-gray-400 line-through">
                PKR {service.price?.toLocaleString()}
              </p>
            )}
          </div>
          <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg">
            {categoryInfo.name}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ------------------ MODALS ------------------ */

const DeleteModal = ({ service, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Service?</h3>
        <p className="text-gray-500">
          Are you sure you want to delete "<span className="font-semibold">{service?.title}</span>"?
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 flex items-center justify-center gap-2"
        >
          {loading ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaTrash className="w-4 h-4" />}
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

const StatusToggle = ({ isActive, onChange }) => (
  <div className="flex items-center gap-4">
    <button
      type="button"
      onClick={() => onChange(true)}
      className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2
        ${isActive ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
    >
      <FaToggleOn className={`w-5 h-5 ${isActive ? "text-green-600" : "text-gray-400"}`} />
      Active
    </button>
    <button
      type="button"
      onClick={() => onChange(false)}
      className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2
        ${!isActive ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
    >
      <FaToggleOff className={`w-5 h-5 ${!isActive ? "text-red-600" : "text-gray-400"}`} />
      Inactive
    </button>
  </div>
);

const EditModal = ({ service, categories, onClose, onSave, loading }) => {
  const categoryInfo = getCategoryInfo(service);
  
  const [form, setForm] = useState({
    title: service?.title || "",
    description: service?.description || "",
    category: categoryInfo.id,
    price: service?.price || "",
    discountPercentage: service?.discount?.percentage || "",
    status: service?.status || "active",
    image: null,
  });

  const [preview, setPreview] = useState(getImageUrl(service?.image?.url));
  const [errors, setErrors] = useState({});
  const inputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = "Valid price is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const price = parseFloat(form.price);
    const discountPercentage = parseFloat(form.discountPercentage) || 0;

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("category", form.category);
    formData.append("price", price);
    formData.append("discountPercentage", discountPercentage);
    formData.append("status", form.status);

    if (form.image) {
      formData.append("image", form.image);
    }

    onSave(service._id, formData);
  };

  const finalPrice = form.price - (form.price * (form.discountPercentage || 0)) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaEdit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Edit Service</h3>
              <p className="text-sm text-gray-500">Update service details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaImage className="w-4 h-4 text-gray-400" /> Service Image
            </label>
            <div
              onClick={() => inputRef.current?.click()}
              className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 overflow-hidden"
            >
              {preview ? (
                <div className="relative aspect-video">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" onError={() => setPreview(null)} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">Click to change</span>
                  </div>
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center">
                  <FaCloudUploadAlt className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-gray-500">Click to upload</p>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <FaToggleOn className="w-4 h-4 text-gray-400" /> Status
            </label>
            <StatusToggle
              isActive={form.status === "active"}
              onChange={(isActive) => setForm(prev => ({ ...prev, status: isActive ? "active" : "inactive" }))}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaTag className="w-4 h-4 text-gray-400" /> Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none ${errors.title ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-500"}`}
              placeholder="Service title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaAlignLeft className="w-4 h-4 text-gray-400" /> Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none resize-none ${errors.description ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-500"}`}
              placeholder="Service description"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaList className="w-4 h-4 text-gray-400" /> Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none ${errors.category ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-500"}`}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          {/* Pricing */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaDollarSign className="w-4 h-4 text-gray-400" /> Price (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none ${errors.price ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-500"}`}
                placeholder="e.g., 3500"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaPercent className="w-4 h-4 text-gray-400" /> Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.discountPercentage}
                onChange={(e) => setForm(prev => ({ ...prev, discountPercentage: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
                placeholder="e.g., 10"
              />
            </div>
          </div>

          {/* Price Preview */}
          {form.price && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Final Price:</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-gray-900">
                    PKR {finalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  {form.discountPercentage > 0 && (
                    <span className="ml-2 text-sm text-green-600 font-medium">({form.discountPercentage}% off)</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-100 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2"
          >
            {loading ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaSave className="w-4 h-4" />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------ OTHER COMPONENTS ------------------ */

const EmptyState = ({ onAdd }) => (
  <div className="text-center py-16">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <FaBoxOpen className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">No Services Found</h3>
    <p className="text-gray-500 mb-6">Start by adding your first service.</p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg"
    >
      <FaPlus className="w-4 h-4" /> Add First Service
    </button>
  </div>
);

const LoadingSkeleton = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="aspect-video bg-gray-200" />
        <div className="p-5 space-y-3">
          <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
          <div className="h-4 bg-gray-200 rounded-lg w-full" />
          <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-6 bg-gray-200 rounded-lg w-24" />
            <div className="h-6 bg-gray-200 rounded-lg w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
        {type === "success" ? <FaCheckCircle className="w-5 h-5" /> : <FaExclamationCircle className="w-5 h-5" />}
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-80">
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function AllServices() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [editService, setEditService] = useState(null);
  const [deleteServiceData, setDeleteServiceData] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        getAllServices(),
        getCategories()
      ]);

      console.log("Services:", servicesRes.data);
      console.log("Categories:", categoriesRes.data);

      setServices(servicesRes.data?.data || []);
      setCategories(categoriesRes.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setToast({ message: "Failed to load data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (serviceId, formData) => {
    try {
      setActionLoading(true);
      await updateService(serviceId, formData);
      setToast({ message: "Service updated successfully", type: "success" });
      setEditService(null);
      fetchData();
    } catch (error) {
      setToast({ message: error.response?.data?.message || "Failed to update", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await deleteService(deleteServiceData._id);
      setToast({ message: "Service deleted successfully", type: "success" });
      setDeleteServiceData(null);
      fetchData();
    } catch (error) {
      setToast({ message: "Failed to delete", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      setActionLoading(true);
      const newStatus = (service.status === "active" || !service.status) ? "inactive" : "active";
      const formData = new FormData();
      formData.append("status", newStatus);
      await updateService(service._id, formData);
      setToast({ message: `Service ${newStatus === "active" ? "activated" : "deactivated"}`, type: "success" });
      fetchData();
    } catch (error) {
      setToast({ message: "Failed to update status", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch = !searchQuery ||
      service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const categoryInfo = getCategoryInfo(service);
    const matchesCategory = !filterCategory || categoryInfo.id === filterCategory;

    const serviceStatus = service.status || "active";
    const matchesStatus = !filterStatus || serviceStatus === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const totalServices = services.length;
  const activeServices = services.filter(s => s.status === "active" || !s.status).length;
  const inactiveServices = services.filter(s => s.status === "inactive").length;

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("");
    setFilterStatus("");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 group"
        >
          <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <FaList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">All Services</h1>
              <p className="text-gray-500">Manage your service listings</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/add-service")}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
          >
            <FaPlus className="w-4 h-4" /> Add New Service
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
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
              <p className="text-2xl font-bold text-gray-900">{activeServices}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <FaToggleOff className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inactiveServices}</p>
              <p className="text-sm text-gray-500">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="relative min-w-[180px]">
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none appearance-none cursor-pointer bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[150px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none appearance-none cursor-pointer bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {(searchQuery || filterCategory || filterStatus) && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
            >
              <FaTimes className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredServices.length === 0 ? (
        services.length === 0 ? (
          <EmptyState onAdd={() => navigate("/admin/add-service")} />
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border">
            <FaSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Results Found</h3>
            <button onClick={clearFilters} className="text-blue-600 font-medium hover:underline">
              Clear all filters
            </button>
          </div>
        )
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Showing {filteredServices.length} of {services.length} services
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onEdit={setEditService}
                onDelete={setDeleteServiceData}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {editService && (
        <EditModal
          service={editService}
          categories={categories}
          onClose={() => setEditService(null)}
          onSave={handleSaveEdit}
          loading={actionLoading}
        />
      )}

      {deleteServiceData && (
        <DeleteModal
          service={deleteServiceData}
          onClose={() => setDeleteServiceData(null)}
          onConfirm={confirmDelete}
          loading={actionLoading}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}