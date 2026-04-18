import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getAdminSlides, addAdminSlide, deleteAdminSlide, updateAdminProfile } from "../../api/adminEndPoints";
import { FaTrash, FaPlus, FaSpinner, FaImage, FaUserEdit, FaLock, FaSave } from "react-icons/fa";
import { buildMediaUrl } from "../../utils/url";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
  const { user, login } = useAuth(); // or something to refresh user data context
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'slider'

  // --- Slider State ---
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [ctaText, setCtaText] = useState("Book Now");
  const [ctaLink, setCtaLink] = useState("/post-job");
  const [order, setOrder] = useState(0);

  // --- Profile State ---
  const [profileName, setProfileName] = useState(user?.full_name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(user?.profileImage ? buildMediaUrl(user.profileImage) : null);

  // === Queries ===
  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["adminSlides"],
    queryFn: async () => {
      const res = await getAdminSlides();
      return res.data?.data || [];
    },
  });

  // === Mutations ===
  const addSlideMutation = useMutation({
    mutationFn: addAdminSlide,
    onSuccess: () => {
      toast.success("Slide added successfully!");
      queryClient.invalidateQueries(["adminSlides"]);
      // Reset form
      setImageFile(null);
      setPreview(null);
      setTitle("");
      setCtaText("Book Now");
      setCtaLink("/post-job");
      setOrder(0);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add slide");
    },
  });

  const deleteSlideMutation = useMutation({
    mutationFn: deleteAdminSlide,
    onSuccess: () => {
      toast.success("Slide deleted successfully!");
      queryClient.invalidateQueries(["adminSlides"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete slide");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: (res) => {
      toast.success("Profile updated successfully!");
      // Optionally update context user
      if (login && res.data?.data) {
        // We'd ideally need a token refresh or just update the local user info if context supports it
      }
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (profileName) formData.append("full_name", profileName);
    if (currentPassword) formData.append("currentPassword", currentPassword);
    if (newPassword) formData.append("newPassword", newPassword);
    if (profileImageFile) formData.append("profileImage", profileImageFile);

    updateProfileMutation.mutate(formData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSlide = (e) => {
    e.preventDefault();
    if (!imageFile || !title) {
      toast.error("Image and Title are required");
      return;
    }
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("title", title);
    formData.append("ctaText", ctaText);
    formData.append("ctaLink", ctaLink);
    formData.append("order", order);

    addSlideMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
          <p className="text-gray-500 text-sm">Manage your profile and platform content</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "profile" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Admin Profile
        </button>
        <button
          onClick={() => setActiveTab("slider")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "slider" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Landing Page Slider
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="max-w-3xl bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaUserEdit className="text-blue-500" /> Personal Information
          </h3>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            {/* Display / Update Profile Picture */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                {profilePreview || user?.profileImage ? (
                  <img src={profilePreview || buildMediaUrl(user.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-3xl">
                    {user?.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <hr className="border-gray-100" />
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaLock className="text-blue-500" /> Security
            </h3>

            {/* Password changes */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={updateProfileMutation.isLoading}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {updateProfileMutation.isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "slider" && (
        <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left: Add New Slide Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Slide</h3>
            <form onSubmit={handleAddSlide} className="space-y-4">
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slide Image *</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  ) : (
                    <>
                      <FaImage className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
                      <span className="text-sm text-gray-500 font-medium">Click to upload image</span>
                    </>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Heading *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Premium Home Maintenance"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* CTA Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={addSlideMutation.isLoading}
                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {addSlideMutation.isLoading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                Add Slide
              </button>
            </form>
          </div>
        </div>

        {/* Right: Existing Slides */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Active Slides</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <FaSpinner className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : slides.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <FaImage className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No custom slides found</p>
                <p className="text-xs text-gray-400 mt-1">The system will use default hardcoded images.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {slides.map((slide) => (
                  <div key={slide._id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    {/* Image Thumbnail */}
                    <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                      <img src={buildMediaUrl(slide.image)} alt={slide.title} className="w-full h-full object-cover" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800 truncate">{slide.title}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Order: {slide.order}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this slide?")) {
                              deleteSlideMutation.mutate(slide._id);
                            }
                          }}
                          disabled={deleteSlideMutation.isLoading}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                        <span>{slide.ctaText}</span>
                        <span className="text-blue-300">→</span>
                        <span className="font-mono text-[10px]">{slide.ctaLink}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
