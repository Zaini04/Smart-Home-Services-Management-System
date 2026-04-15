import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  FaUser, FaEnvelope, FaPhone, FaCity, FaMapMarkerAlt, 
  FaCamera, FaCheckCircle, FaSpinner 
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { getUserProfile, updateUserProfile } from "../../api/residentsEndpoints";
import Navbar from "../../components/Navbar"; // Adjust path if needed
import Footer from "../../components/Footer"; // Adjust path if needed
import { buildMediaUrl } from "../../utils/url";

export default function UserProfile() {
  const { user, loginUser, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "", email: "", phone: "", city: "", address: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      const data = res.data.data;
      console.log("Fetched Profile:", data);
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
        address: data.address || "",
      });
      setPreviewImage(data.profileImage || "");
    } catch (error) {
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("userId", user._id); 

      fd.append("full_name", formData.full_name);
      fd.append("phone", formData.phone);
      fd.append("city", formData.city);
      fd.append("address", formData.address);
      if (imageFile) fd.append("profileImage", imageFile);

      const res = await updateUserProfile(fd);
      toast.success("Profile updated successfully!");
      
      // Instantly update the Context so Navbars update
      loginUser(res.data.data, accessToken); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-blue-500 w-12 h-12" />
      </div>
    );
  }

  const isResident = user?.role === "resident";

  return (
    <>
      {isResident && <Navbar />}
      
      <div className={`min-h-screen bg-gray-50 ${isResident ? "py-10" : "py-4"}`}>
        <div className="max-w-4xl mx-auto space-y-6 px-4">
          
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Your Profile</h1>
            <p className="text-gray-500 text-sm">
              {user?.role === "serviceprovider" 
                ? "Update your base account details here. Go to 'Edit Profile' to change skills and KYC." 
                : "Manage your personal information"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {previewImage ? (
                    <img src={buildMediaUrl(previewImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="w-full h-full p-6 text-gray-300" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition shadow-md">
                  <FaCamera className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-gray-800 text-lg">{formData.full_name}</h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mt-1 inline-block">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <FaUser className="text-blue-600" /> Personal Details
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" required
                      value={formData.full_name} 
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" disabled value={formData.email} 
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" required value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <div className="relative">
                    <FaCity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" required value={formData.city} 
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />
                    <textarea 
                      rows={3} required value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button 
                type="submit" disabled={saving}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaCheckCircle /> Save Profile</>}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {isResident && <Footer />}
    </>
  );
}