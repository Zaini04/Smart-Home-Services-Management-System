import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { 
  FaUser, FaEnvelope, FaPhone, FaCity, FaMapMarkerAlt, 
  FaCamera, FaCheckCircle, FaSpinner 
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { getUserProfile, updateUserProfile } from "../../api/residentsEndpoints";
import { buildMediaUrl } from "../../utils/url";

export default function UserProfile() {
  const { user, loginUser, accessToken } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: "", email: "", phone: "", city: "", address: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  // Fetch Profile Hook
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await getUserProfile();
      return res.data.data;
    },
    onSuccess: (data) => {
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
        address: data.address || "",
      });
      setPreviewImage(data.profileImage || "");
    }
  });

  // Populate state securely
  useEffect(() => {
    if (profileData) {
      setFormData({
        full_name: profileData.full_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        city: profileData.city || "",
        address: profileData.address || "",
      });
      setPreviewImage(profileData.profileImage || "");
    }
  }, [profileData]);

  const updateMutation = useMutation({
    mutationFn: (fd) => updateUserProfile(fd),
    onSuccess: (res) => {
      toast.success("Profile updated successfully!");
      // Provide new details to global context
      loginUser(res.data.data, accessToken);
      // Update query cache
      queryClient.setQueryData(["userProfile"], res.data.data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("userId", user._id); 

    fd.append("full_name", formData.full_name);
    fd.append("phone", formData.phone);
    fd.append("city", formData.city);
    fd.append("address", formData.address);
    if (imageFile) fd.append("profileImage", imageFile);

    updateMutation.mutate(fd);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-yellow-500 w-12 h-12" />
      </div>
    );
  }

  const isResident = user?.role === "resident";

  return (
    <div className={`min-h-screen bg-gray-50 ${isResident ? "py-10" : "py-4"}`}>
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.role === "serviceprovider" 
              ? "Update your base account details here. Go to 'Edit Profile' to change skills and KYC." 
              : "Manage your personal information"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-50 border border-gray-200">
                {previewImage ? (
                  <img src={buildMediaUrl(previewImage)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="w-full h-full p-6 text-gray-300" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 cursor-pointer hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20">
                <FaCamera className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-gray-900 text-xl">{formData.full_name || "Name not set"}</h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider mt-2 inline-block">
                {user?.role === "serviceprovider" ? "Service Provider" : "Resident"}
              </span>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FaUser className="text-gray-500 w-4 h-4" />
              </div>
              Personal Details
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" required
                    value={formData.full_name} 
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all bg-gray-50 focus:bg-white text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" disabled value={formData.email} 
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" required value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all bg-gray-50 focus:bg-white text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <div className="relative">
                  <FaCity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" required value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all bg-gray-50 focus:bg-white text-sm font-medium"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />
                  <textarea 
                    rows={3} required value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all bg-gray-50 focus:bg-white resize-none text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit" disabled={updateMutation.isPending}
              className="px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaCheckCircle /> Save Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}