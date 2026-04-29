// residentLayout/ResidentNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  FaBars, FaBell, FaCalendarAlt, FaClipboardList,
  FaUser, FaSignOutAlt, FaChevronDown, FaPlus, FaComments
} from "react-icons/fa";

function ResidentNavbar({ onHamburgerClick, user, onOpenDrawer, hasNewNotifications, unreadMessages }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { logoutUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getPageTitle = () => {
    if (location.pathname.startsWith("/post-job"))    return "Book a Service";
    if (location.pathname.startsWith("/my-bookings")) return "My Bookings";
    if (location.pathname.startsWith("/chat"))        return "Messages";
    if (location.pathname.startsWith("/profile"))     return "My Profile";
    if (location.pathname.startsWith("/settings"))    return "Settings";
    if (location.pathname.startsWith("/support"))     return "Support";
    return "Dashboard";
  };

  const handleLogout = () => { setDropdownOpen(false); logoutUser(); navigate("/login"); };

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("#res-navbar-dropdown")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="flex-shrink-0 h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-3 shadow-sm z-20 relative">

      {/* Hamburger — mobile only */}
      <button
        onClick={onHamburgerClick}
        className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <FaBars className="w-4 h-4 text-gray-600" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-gray-800 text-base leading-tight truncate">{getPageTitle()}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link to="/post-job" className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
          <FaPlus className="w-3 h-3" /> Book Now
        </Link>
        <span className="hidden sm:block w-px h-6 bg-gray-200 mx-2" />
        
        {/* Messages — mobile only */}
        {/* <Link
          to="/chat"
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors sm:hidden"
        >
          <FaComments className="w-5 h-5 text-gray-600" />
          {unreadMessages > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          )}
        </Link> */}

        {/* Notifications */}
        {/* <div className="relative cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={() => onOpenDrawer("notifications")}>
          <FaBell className="w-4 h-4 text-gray-600" />
          {hasNewNotifications && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
        </div> */}

        {/* Calendar */}
        {/* <div className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={() => onOpenDrawer("calendar")}>
          <FaCalendarAlt className="w-4 h-4 text-gray-600" />
        </div> */}

        {/* Profile Dropdown */}
        <div className="relative ml-2" id="res-navbar-dropdown">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-indigo-700 bg-indigo-100 border border-gray-200 flex-shrink-0">
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="hidden sm:block text-left max-w-28">
              <p className="font-semibold text-gray-800 text-sm leading-none truncate">{user?.full_name || "User"}</p>
            </div>
            <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-gray-100">
                <p className="font-bold text-gray-800 text-sm truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <Link to="/my-bookings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <FaClipboardList className="w-4 h-4 text-gray-400" /> My Bookings
                </Link>
                <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <FaUser className="w-4 h-4 text-gray-400" /> Profile
                </Link>
              </div>
              <div className="border-t border-gray-100 pt-1 mt-1 pb-1">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <FaSignOutAlt className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default ResidentNavbar;

