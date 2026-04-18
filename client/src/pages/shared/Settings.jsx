import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaLock, FaCheckCircle, FaSpinner, FaBell, FaShieldAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { changePassword } from "../../api/residentsEndpoints";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Settings() {
  const { user } = useAuth();
  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    
    setLoading(true);
    try {
      await changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      toast.success("Password updated successfully!");
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const isResident = user?.role === "resident";

  return (
    <>
      
      
      <div className={`min-h-screen bg-gray-50 ${isResident ? "py-10" : "py-4"}`}>
        <div className="max-w-4xl mx-auto space-y-6 px-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-500 text-sm">Manage your security and preferences</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Password */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <FaShieldAlt className="text-blue-600" /> Security & Password
                </h3>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="password" required value={passData.currentPassword} onChange={(e) => setPassData({...passData, currentPassword: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="password" required minLength="6" value={passData.newPassword} onChange={(e) => setPassData({...passData, newPassword: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="password" required minLength="6" value={passData.confirmPassword} onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={loading} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all flex items-center gap-2">
                      {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaBell className="text-blue-600" /> Preferences
                </h3>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Push Notifications</p>
                    <p className="text-xs text-gray-500">Alerts for job updates</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifications ? "left-7" : "left-1"}`}></div>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      
    </>
  );
}