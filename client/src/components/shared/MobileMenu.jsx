// components/navbar/MobileMenu.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FaTimes,
  FaClipboardList,
  FaComments,
  FaUserCircle,
  FaCog,
  FaBell,
  FaCalendarAlt,
  FaPlus,
  FaSignOutAlt,
} from "react-icons/fa";

const MobileMenu = ({
  isOpen,
  onClose,
  user,
  onLogout,
  navLinks,
  onScrollTo,
  unreadMessages,
}) => {
  if (!isOpen) return null;

  const residentMenuItems = [
    { icon: FaClipboardList, label: "My Bookings",   link: "/my-bookings",    dotBadge: user?.hasNewBookings },
    { icon: FaComments,      label: "Messages",       link: "/chat",           dot: unreadMessages > 0 },
    { icon: FaUserCircle,    label: "My Profile",     link: "/profile" },
    { icon: FaCog,           label: "Settings",       link: "/settings" },
    { icon: FaBell,          label: "Notifications",  link: "/notifications",  dotBadge: user?.hasNewNotifications },
    { icon: FaCalendarAlt,   label: "My Calendar",    link: "/calendar" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gray-900 shadow-2xl z-50 lg:hidden animate-slideIn overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-gray-900">
          <span className="font-bold text-lg text-white">Menu</span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* User Info (if logged in) */}
        {user && (
          <div className="p-4 bg-gray-800/60 border-b border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white capitalize">
                  {user?.full_name || "User"}
                </p>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>
            <Link
              to="/post-job"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-yellow-500 text-gray-900 rounded-xl font-bold text-sm hover:bg-yellow-400 transition-colors shadow-sm"
            >
              <FaPlus className="w-3.5 h-3.5" />
              Book a Service
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
            Navigation
          </p>
          {navLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => {
                if (link.scrollTo) onScrollTo(link.scrollTo);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition-colors text-left"
            >
              {link.scrollTo ? (
                <>
                  <link.icon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{link.label}</span>
                </>
              ) : (
                <Link to={link.path} className="flex items-center gap-3 w-full">
                  <link.icon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )}
            </button>
          ))}
        </nav>

        {/* Resident Account Items */}
        {user && (
          <div className="px-4 pb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
              My Account
            </p>
            <div className="space-y-1">
              {residentMenuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition-colors"
                >
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium flex-1">{item.label}</span>
                  {(item.badge || item.dot || item.dotBadge) && (
                    <span className="w-2 h-2 bg-red-500 rounded-full inline-block shadow-sm" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="sticky bottom-0 p-4 border-t border-gray-800 bg-gray-900">
          {user ? (
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>Logout</span>
            </button>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={onClose}
                className="block w-full text-center px-4 py-3 bg-yellow-500 text-gray-900 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="block w-full text-center px-4 py-3 bg-gray-800 text-gray-200 rounded-xl font-medium hover:bg-gray-700 transition-colors border border-gray-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;

