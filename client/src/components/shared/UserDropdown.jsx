// components/navbar/UserDropdown.jsx
import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUserCircle,
  FaClipboardList,
  FaComments,
  FaCog,
  FaHeadset,
  FaCalendarAlt,
  FaBell,
  FaPlus,
  FaSignOutAlt,
} from "react-icons/fa";

const UserDropdown = ({ user, onLogout, onClose, unreadMessages }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const menuItems = [
    { icon: FaUserCircle,    label: "My Profile",     link: "/profile" },
    { icon: FaClipboardList, label: "My Bookings",    link: "/my-bookings",    dotBadge: user?.hasNewBookings },
    { icon: FaComments,      label: "Messages",       link: "/chat",           dot: unreadMessages > 0 },
    { icon: FaCog,           label: "Settings",       link: "/settings" },
    { icon: FaHeadset,       label: "Help & Support", link: "/support" },
    { icon: FaCalendarAlt,   label: "My Calendar",    link: "/calendar" },
    { icon: FaBell,          label: "Notifications",  link: "/notifications",  dotBadge: user?.hasNewNotifications },
  ];

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-fadeIn"
    >
      {/* User Info Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate capitalize">
              {user?.full_name || "User"}
            </p>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
          Resident
        </span>
      </div>

      {/* Quick Action — Book a Service */}
      <div className="px-3 py-2 border-b border-gray-100">
        <Link
          to="/post-job"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-yellow-500 text-gray-900 rounded-xl font-bold hover:bg-yellow-400 transition-colors text-sm shadow-sm"
        >
          <FaPlus className="w-3.5 h-3.5" />
          Book a Service
        </Link>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <item.icon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium flex-1">{item.label}</span>
            {(item.badge || item.dot) && (
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 border-2 border-white" />
            )}
            {item.dotBadge && (
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block" />
            )}
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100 pt-2 px-3 pb-1">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;

