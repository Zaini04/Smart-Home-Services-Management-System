import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getAdminSlides, addAdminSlide, deleteAdminSlide, updateAdminProfile } from "../../api/adminEndPoints";
import { FaImage, FaSpinner, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

// Components
import ProfileSection from "../../components/admin/settings/ProfileSection";
import SliderForm from "../../components/admin/settings/SliderForm";
import SlideCard from "../../components/admin/settings/SlideCard";

export default function Settings() {
  const { user, login } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'slider'

  // Slider State
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [ctaText, setCtaText] = useState("Book Now");
  const [ctaLink, setCtaLink] = useState("/post-job");
  const [order, setOrder] = useState(0);

  // Profile State
  const [profileName, setProfileName] = useState(user?.full_name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // Queries
  const { data: slides = [], isLoading: slidesLoading } = useQuery({
    queryKey: ["adminSlides"],
    queryFn: async () => {
      const res = await getAdminSlides();
      return res.data?.data || [];
    },
  });

  // Mutations
  const addSlideMutation = useMutation({
    mutationFn: addAdminSlide,
    onSuccess: () => {
      toast.success("Slide published successfully!");
      queryClient.invalidateQueries(["adminSlides"]);
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
      toast.success("Slide removed!");
      queryClient.invalidateQueries(["adminSlides"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete slide");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: (res) => {
      toast.success("Profile updated!");
      setCurrentPassword("");
      setNewPassword("");
      setProfileImageFile(null);
      // login(res.data.data); // If login handles updating local state
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed");
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
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Settings</h1>
          <p className="text-gray-500 mt-1">Configure your personal profile and website content</p>
        </div>
        
        {/* Simplified Tab Switcher */}
        <div className="flex p-1.5 bg-gray-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "profile" 
                ? "bg-white text-blue-600 shadow-md scale-100" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Admin Profile
          </button>
          <button
            onClick={() => setActiveTab("slider")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "slider" 
                ? "bg-white text-blue-600 shadow-md scale-100" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Slider Content
          </button>
        </div>
      </div>

      {activeTab === "profile" ? (
        <ProfileSection 
          user={user}
          profileName={profileName}
          setProfileName={setProfileName}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          profilePreview={profilePreview}
          handleProfileImageChange={handleProfileImageChange}
          handleUpdateProfile={handleUpdateProfile}
          loading={updateProfileMutation.isPending}
        />
      ) : (
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <SliderForm 
              onSubmit={handleAddSlide}
              title={title} setTitle={setTitle}
              ctaText={ctaText} setCtaText={setCtaText}
              ctaLink={ctaLink} setCtaLink={setCtaLink}
              order={order} setOrder={setOrder}
              preview={preview}
              handleImageChange={handleImageChange}
              loading={addSlideMutation.isPending}
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaUserCircle className="text-blue-600" />
                Active Banner Slides
              </h3>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                {slides.length} Slides
              </span>
            </div>
            
            {slidesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
                <FaSpinner className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400 font-medium">Fetching slider data...</p>
              </div>
            ) : slides.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaImage className="text-gray-300 text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No Custom Slides</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-1 text-sm">
                  The homepage will show default placeholder content until you add your own slides.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {slides.map((slide) => (
                  <SlideCard 
                    key={slide._id} 
                    slide={slide} 
                    onDelete={(id) => deleteSlideMutation.mutate(id)}
                    deleting={deleteSlideMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
