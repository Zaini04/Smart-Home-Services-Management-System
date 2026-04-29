import React from "react";
import { FaUserEdit, FaLock, FaSpinner, FaSave } from "react-icons/fa";
import { buildMediaUrl } from "../../../utils/url";

const ProfileSection = ({ 
  user, 
  profileName, 
  setProfileName, 
  currentPassword, 
  setCurrentPassword, 
  newPassword, 
  setNewPassword, 
  profilePreview, 
  handleProfileImageChange, 
  handleUpdateProfile, 
  loading 
}) => {
  return (
    <div className="max-w-3xl bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
          <FaUserEdit />
        </div>
        Personal Information
      </h3>
      
      <form onSubmit={handleUpdateProfile} className="space-y-8">
        {/* Profile Picture */}
        <div className="flex flex-col sm:flex-row items-center gap-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-xl">
              {profilePreview || user?.profileImage ? (
                <img 
                  src={profilePreview || buildMediaUrl(user.profileImage)} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-4xl">
                  {user?.full_name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 border-2 border-white">
              <FaUserEdit className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
            </label>
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-lg font-bold text-gray-900">{user?.full_name}</h4>
            <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Administrator Account</p>
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Name</label>
          <input
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
            placeholder="Your full name"
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <FaLock />
            </div>
            Security & Password
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Current Password</label>
              <input
                type="password"
                placeholder="Required for any changes"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">New Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Keep passwords blank if you don't want to change them. Standard security protocols apply.
          </p>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSection;
