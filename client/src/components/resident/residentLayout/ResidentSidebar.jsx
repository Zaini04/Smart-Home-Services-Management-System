// residentLayout/ResidentSidebar.jsx
import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  FaHome, FaBell, FaClipboardList, FaComments, FaCalendarAlt,
  FaUser, FaSignOutAlt, FaTimes, FaChevronRight, FaCog,
  FaHeadset, FaArrowLeft, FaPlus,
} from "react-icons/fa";

const navItems = [
  { to: "/post-job",         icon: FaPlus,          label: "Book a Service", highlight: true },
  { to: "/my-bookings",      icon: FaClipboardList, label: "My Bookings" },
  { to: "/chat",             icon: FaComments,      label: "Messages" },
  { action: "calendar",      icon: FaCalendarAlt,   label: "Calendar" },
  { action: "notifications", icon: FaBell,          label: "Notifications" },
  { to: "/profile",          icon: FaUser,          label: "My Profile" },
  { to: "/settings",         icon: FaCog,           label: "Settings" },
  { to: "/support",          icon: FaHeadset,       label: "Support" },
];

function ResidentSidebar({ user, onClose, hasNewNotifications, hasNewBookings, unreadMessages, onOpenDrawer }) {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const dynamicItems = navItems.map((item) => {
    if (item.action === "notifications" && hasNewNotifications) return { ...item, dot: true };
    if (item.to === "/my-bookings" && hasNewBookings) return { ...item, dot: true };
    if (item.to === "/chat" && unreadMessages > 0) return { ...item, dot: true };
    return item;
  });

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">

      {/* Brand Header */}
      <div className="flex-shrink-0 px-4 pt-5 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <FaHome className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">ResidentPanel</p>
              <p className="text-xs text-gray-400 mt-0.5">Control Center</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-800 transition-colors flex-shrink-0">
              <FaTimes className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Row */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800 border-2 border-gray-700 flex-shrink-0 flex items-center justify-center font-bold text-gray-300">
            {user?.full_name?.charAt(0)?.toUpperCase() || "H"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm truncate leading-none">{user?.full_name || "Resident"}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 bg-blue-900/40 text-blue-300 border border-blue-800">
              Homeowner
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-1 overflow-y-auto px-3 py-3 min-h-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Navigation</p>
        <div className="space-y-0.5">
          {dynamicItems.map((item, idx) => {
            const Icon = item.icon;
            if (item.action) {
              return (
                <button
                  key={`btn-${idx}`}
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
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive ? "bg-yellow-500 text-gray-900 shadow-md font-bold"
                    : item.highlight ? "bg-gray-800 text-yellow-500 border border-gray-700 hover:bg-gray-700"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-gray-900" : item.highlight ? "text-yellow-500" : "text-gray-500 group-hover:text-white"}`} />
                    <span className="font-medium text-sm flex-1 truncate">{item.label}</span>
                    {item.dot && <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" />}
                    {isActive && <FaChevronRight className="w-3 h-3 text-white/60 flex-shrink-0" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 px-3 pb-4 pt-3 border-t border-gray-800 space-y-1">
        <Link to="/" onClick={onClose} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors group">
          <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium text-sm">Back to Home</span>
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors group">
          <FaSignOutAlt className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default ResidentSidebar;

