// providerLayout/ProviderSidebar.jsx
import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FaTools, FaTimes, FaUser, FaLock, FaSignOutAlt, FaChevronRight } from "react-icons/fa";
import { buildMediaUrl } from "../../../utils/url";
import { getNavItems } from "./providerNavConstants";

function ProviderSidebar({ user, provider, profileCompleted, kycStatus, onClose, hasNewNotifications, hasNewJobs, unreadMessages, onOpenDrawer }) {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const baseNavItems = getNavItems(profileCompleted, kycStatus);
  const navItems = baseNavItems.map(item => {
    if (item.label === "Notifications" && hasNewNotifications) return { ...item, dot: true };
    if (item.label === "Available Jobs" && hasNewJobs) return { ...item, badge: "New" };
    if (item.label === "My Jobs" && hasNewJobs) return { ...item, dot: true };
    if (item.label === "Messages" && unreadMessages > 0) return { ...item, dot: true };
    return item;
  });

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Brand Header — compact */}
      <div className="flex-shrink-0 px-4 pt-5 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <FaTools className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">WorkerPanel</p>
              <p className="text-xs text-gray-400 mt-0.5">Service Provider</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-800 transition-colors flex-shrink-0">
              <FaTimes className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Compact Profile Row */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200 flex-shrink-0">
            {provider?.profileImage ? (
              <img src={buildMediaUrl(provider.profileImage)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaUser className="w-4 h-4 text-blue-500" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm truncate leading-none">{provider?.name || "Provider"}</p>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
              kycStatus === "approved" ? "bg-green-900/50 text-green-400"
              : kycStatus === "rejected" ? "bg-red-900/50 text-red-400"
              : !profileCompleted ? "bg-gray-800 text-gray-300"
              : "bg-yellow-900/50 text-yellow-400"
            }`}>
              {kycStatus === "approved" ? "✓ Approved"
                : kycStatus === "rejected" ? "✗ Rejected"
                : !profileCompleted ? "● Setup Required"
                : "⏳ Under Review"}
            </span>
          </div>
        </div>

        {/* Context message */}
        {kycStatus !== "approved" && (
          <div className={`mt-3 rounded-xl px-3 py-2 text-xs leading-relaxed ${
            !profileCompleted ? "bg-blue-900/30 text-blue-300 border border-blue-800"
            : kycStatus === "rejected" ? "bg-red-900/30 text-red-300 border border-red-800"
            : "bg-yellow-900/30 text-yellow-300 border border-yellow-800"
          }`}>
            {!profileCompleted ? "Complete your profile to unlock all features."
              : kycStatus === "rejected" ? "Profile rejected. Update and resubmit."
              : "Profile is under review. Usually 24–48 hours."}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-1 overflow-y-auto px-3 py-3 min-h-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          {kycStatus === "approved" ? "Navigation" : "Account Setup"}
        </p>

        <div className="space-y-0.5">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            if (item.action) {
              return (
                <button
                  key={`action-${idx}`}
                  onClick={() => { onOpenDrawer(item.action); if (onClose) onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-white" />
                  <span className="font-medium text-sm flex-1 truncate text-left">{item.label}</span>
                  {item.dot && <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" />}
                </button>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive ? "bg-yellow-500 text-gray-900 shadow-md font-bold"
                  : item.highlight ? "bg-gray-800 text-yellow-500 border border-gray-700 hover:bg-gray-700"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-gray-900" : item.highlight ? "text-yellow-500" : "text-gray-500 group-hover:text-white"}`} />
                    <span className="font-medium text-sm flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${isActive ? "bg-gray-900/20 text-gray-900" : "bg-red-500 text-white animate-pulse"}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.dot && <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" />}
                    {item.highlight && !isActive && <FaChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0 animate-pulse" />}
                    {isActive && <FaChevronRight className="w-3 h-3 text-white/60 flex-shrink-0" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {kycStatus !== "approved" && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-2xl p-3 text-gray-800">
            <div className="flex items-center gap-2 mb-1.5">
              <FaLock className="w-3 h-3 text-gray-400" />
              <p className="text-xs font-semibold text-gray-500">Pages Locked</p>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {!profileCompleted ? "Complete profile setup to unlock Dashboard, Jobs, Offers and more."
                : kycStatus === "rejected" ? "Fix your profile and resubmit to unlock all features."
                : "All pages unlock once admin approves your profile."}
            </p>
          </div>
        )}
      </nav>

      <div className="flex-shrink-0 px-3 pb-4 pt-3 border-t border-gray-100 space-y-2">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors group">
          <FaSignOutAlt className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default ProviderSidebar;

