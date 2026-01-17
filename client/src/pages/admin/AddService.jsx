import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addService } from "../../api/adminEndPoints";
import {
  FaCloudUploadAlt,
  FaImage,
  FaTrash,
  FaSpinner,
  FaCheckCircle,
  FaArrowLeft,
  FaDollarSign,
  FaPercent,
  FaTag,
  FaAlignLeft,
  FaList,
  FaInfoCircle,
  FaTimes,
  FaExclamationCircle,
  FaLightbulb,
  FaEye,
  FaSave,
  FaPlus,
} from "react-icons/fa";

/* ------------------ IMAGE UPLOAD COMPONENT ------------------ */

const ImageUpload = ({ image, setImage, error }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(image);
    } else {
      setPreview(null);
    }
  }, [image]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 ${isDragging ? "scale-[1.02]" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <div
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden
          ${error
            ? "border-red-300 bg-red-50"
            : preview
              ? "border-green-400 bg-green-50"
              : isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
          }
        `}
      >
        <div className="aspect-video flex flex-col items-center justify-center p-8 min-h-[250px]">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <div className="text-white text-center">
                  <FaImage className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">Click to change image</span>
                </div>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImage(null);
                }}
                className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors z-10"
              >
                <FaTrash className="w-4 h-4" />
              </button>
              {/* Success badge */}
              <div className="absolute bottom-4 left-4 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-full flex items-center gap-2 shadow-lg">
                <FaCheckCircle className="w-4 h-4" />
                Image uploaded
              </div>
            </>
          ) : (
            <>
              <div className={`p-6 rounded-2xl ${isDragging ? "bg-blue-100" : "bg-white"} shadow-sm mb-4 transition-colors`}>
                <FaCloudUploadAlt className={`w-12 h-12 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
              </div>
              <p className="text-gray-700 font-semibold mb-1">
                {isDragging ? "Drop image here" : "Drop image here or click to upload"}
              </p>
              <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 5MB</p>
              <p className="text-xs text-gray-400 mt-2">Recommended: 800x600 pixels</p>
            </>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
          <FaExclamationCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

/* ------------------ FORM INPUT COMPONENT ------------------ */

const FormInput = ({ icon: Icon, label, error, required, helper, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        className={`
          w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none
          ${error
            ? "border-red-300 bg-red-50 focus:border-red-500"
            : isFocused
              ? "border-blue-500 bg-white shadow-lg shadow-blue-500/10"
              : "border-gray-200 bg-gray-50 hover:border-gray-300"
          }
        `}
      />
      {helper && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{helper}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <FaExclamationCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

/* ------------------ FORM TEXTAREA COMPONENT ------------------ */

const FormTextarea = ({ icon: Icon, label, error, required, helper, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        className={`
          w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none resize-none
          ${error
            ? "border-red-300 bg-red-50 focus:border-red-500"
            : isFocused
              ? "border-blue-500 bg-white shadow-lg shadow-blue-500/10"
              : "border-gray-200 bg-gray-50 hover:border-gray-300"
          }
        `}
      />
      {helper && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{helper}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <FaExclamationCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

/* ------------------ FORM SELECT COMPONENT ------------------ */

const FormSelect = ({ icon: Icon, label, error, required, children, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none appearance-none cursor-pointer
            ${error
              ? "border-red-300 bg-red-50 focus:border-red-500"
              : isFocused
                ? "border-blue-500 bg-white shadow-lg shadow-blue-500/10"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }
          `}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <FaExclamationCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

/* ------------------ PRICE PREVIEW COMPONENT ------------------ */

const PricePreview = ({ price, discountPercentage }) => {
  const originalPrice = parseFloat(price) || 0;
  const discount = parseFloat(discountPercentage) || 0;
  const finalPrice = originalPrice - (originalPrice * discount) / 100;
  const savings = originalPrice - finalPrice;

  if (!originalPrice) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
        <FaEye className="w-4 h-4 text-blue-600" />
        Price Preview
      </h4>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">Final Price</p>
          <p className="text-3xl font-bold text-gray-900">
            PKR {finalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        
        {discount > 0 && (
          <div className="text-right">
            <span className="inline-block px-3 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-full mb-2">
              {discount}% OFF
            </span>
            <p className="text-sm text-gray-500 line-through">
              PKR {originalPrice.toLocaleString()}
            </p>
            <p className="text-sm text-green-600 font-medium">
              Save PKR {savings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function AddService() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [errors, setErrors] = useState({});

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    discountPercentage: "",
    image: null,
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Replace with actual API call
      // const res = await getCategories();
      // setCategories(res.data.data);
      
      // Mock data
      setTimeout(() => {
        setCategories([
          { _id: "1", name: "Electrician" },
          { _id: "2", name: "Plumber" },
          { _id: "3", name: "AC Technician" },
          { _id: "4", name: "Carpenter" },
          { _id: "5", name: "Painter" },
          { _id: "6", name: "Cleaner" },
        ]);
        setFetchingCategories(false);
      }, 500);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setFetchingCategories(false);
    }
  };

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Service title is required";
    } else if (form.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!form.category) {
      newErrors.category = "Please select a category";
    }

    if (!form.price) {
      newErrors.price = "Price is required";
    } else if (parseFloat(form.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (form.discountPercentage) {
      const discount = parseFloat(form.discountPercentage);
      if (discount < 0 || discount > 100) {
        newErrors.discountPercentage = "Discount must be between 0 and 100";
      }
    }

    if (!form.image) {
      newErrors.image = "Service image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("discountPercentage", form.discountPercentage || 0);
      formData.append("image", form.image);

      await addService(formData);

      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate("/admin/services");
      }, 2000);
    } catch (err) {
      setErrors({ 
        submit: err.response?.data?.message || "Failed to add service. Please try again." 
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "",
      price: "",
      discountPercentage: "",
      image: null,
    });
    setErrors({});
  };

  // Success State
  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <FaCheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Added Successfully!</h2>
          <p className="text-gray-600 mb-6">Your new service has been created and is now live.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setSuccess(false);
                resetForm();
              }}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Add Another
            </button>
            <button
              onClick={() => navigate("/admin/services")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center gap-2"
            >
              <FaEye className="w-4 h-4" />
              View Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 group"
        >
          <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <FaPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Add New Service</h1>
            <p className="text-gray-500">Create a new service for customers to book</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <FaExclamationCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-red-800">Failed to add service</p>
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
          <button
            onClick={() => setErrors(prev => ({ ...prev, submit: "" }))}
            className="text-red-600 hover:text-red-800"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <FaImage className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Service Image</h2>
              <p className="text-sm text-gray-500">Upload an attractive image for this service</p>
            </div>
          </div>
          
          <ImageUpload
            image={form.image}
            setImage={(image) => updateForm("image", image)}
            error={errors.image}
          />
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaInfoCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Service Details</h2>
              <p className="text-sm text-gray-500">Basic information about the service</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div data-error={!!errors.title}>
              <FormInput
                icon={FaTag}
                label="Service Title"
                required
                type="text"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="e.g., AC Gas Refill Service"
                error={errors.title}
                helper="Choose a clear, descriptive title"
              />
            </div>

            {/* Description */}
            <div data-error={!!errors.description}>
              <FormTextarea
                icon={FaAlignLeft}
                label="Description"
                required
                rows={5}
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Describe the service in detail. What's included? What are the benefits? Any special features?"
                error={errors.description}
                helper={`${form.description.length}/20 characters minimum`}
              />
            </div>

            {/* Category */}
            <div data-error={!!errors.category}>
              <FormSelect
                icon={FaList}
                label="Category"
                required
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                error={errors.category}
                disabled={fetchingCategories}
              >
                <option value="">
                  {fetchingCategories ? "Loading categories..." : "Select a category"}
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <FaDollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pricing</h2>
              <p className="text-sm text-gray-500">Set the price and any discounts</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            {/* Price */}
            <div data-error={!!errors.price}>
              <FormInput
                icon={FaDollarSign}
                label="Original Price (PKR)"
                required
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => updateForm("price", e.target.value)}
                placeholder="e.g., 3500"
                error={errors.price}
              />
            </div>

            {/* Discount */}
            <div data-error={!!errors.discountPercentage}>
              <FormInput
                icon={FaPercent}
                label="Discount Percentage"
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.discountPercentage}
                onChange={(e) => updateForm("discountPercentage", e.target.value)}
                placeholder="e.g., 10"
                error={errors.discountPercentage}
                helper="Optional: Enter a discount percentage (0-100)"
              />
            </div>
          </div>

          {/* Price Preview */}
          <PricePreview 
            price={form.price} 
            discountPercentage={form.discountPercentage} 
          />
        </div>

        {/* Tips Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <FaLightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Tips for a Great Service Listing</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  Use a high-quality image that shows the service clearly
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  Write a detailed description explaining what's included
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  Set competitive pricing based on market rates
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  Add a small discount to attract more customers
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 sm:flex-none px-6 py-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 sm:flex-none px-6 py-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors order-3 sm:order-2"
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`
              flex-1 px-8 py-4 rounded-xl font-semibold text-white
              flex items-center justify-center gap-3 transition-all order-1 sm:order-3
              ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
              }
            `}
          >
            {loading ? (
              <>
                <FaSpinner className="w-5 h-5 animate-spin" />
                Adding Service...
              </>
            ) : (
              <>
                <FaSave className="w-5 h-5" />
                Add Service
              </>
            )}
          </button>
        </div>
      </form>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}