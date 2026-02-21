import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo (3).png";
import { useAuth } from "../context/AuthContext";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaCog,
  FaCalendarAlt,
  FaHome,
  FaTools,
  FaUsers,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaClipboardList,
  FaHeart,
  FaQuestionCircle,
} from "react-icons/fa";

/* ------------------ DROPDOWN COMPONENT ------------------ */

const UserDropdown = ({ user, onLogout, onClose }) => {
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
    { icon: FaUserCircle, label: "My Profile", link: "/profile" },
    { icon: FaClipboardList, label: "My Bookings", link: "/my-bookings" },
    // { icon: FaBars, label: "Dashboard", link: "/provider-dashboard" },
    { icon: FaHeart, label: "Favorites", link: "/favorites" },
    { icon: FaCog, label: "Settings", link: "/settings" },
    { icon: FaQuestionCircle, label: "Help & Support", link: "/support" },
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
        {user?.role && (
          <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full capitalize">
            {user.role}
          </span>
        )}
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item, index) => (
          <>
          <Link
            key={index}
            to={item.link}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <item.icon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
         {/* { user?.role && ( <Link to='/provider-dashboard'           className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
 >
   <FaBars className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">Dashboard</span>
 </Link>)} */}
         </>
        ))}
      </div>

      {/* Logout Button */}
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

/* ------------------ MOBILE MENU COMPONENT ------------------ */

const MobileMenu = ({ isOpen, onClose, user, onLogout, navLinks }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-bold text-lg text-gray-800">Menu</span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* User Info (if logged in) */}
        {user && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 capitalize">
                  {user?.full_name || "User"}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <link.icon className="w-5 h-5 text-gray-400" />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          {user ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>Logout</span>
            </button>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={onClose}
                className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="block w-full text-center px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
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

/* ------------------ MAIN NAVBAR COMPONENT ------------------ */

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutUser, user } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutUser();
    setIsUserDropdownOpen(false);
    navigate("/");
  };

  const navLinks = user
    ? [
        { label: "Home", path: "/", icon: FaHome },
        { label: "Services", path: "/allservices", icon: FaTools },
        { label: "Workers", path: "/serviceproviders", icon: FaUsers },
        { label: "My Bookings", path: "/my-bookings", icon: FaCalendarAlt },
      ]
    : [
        { label: "Home", path: "/", icon: FaHome },
        { label: "Services", path: "/allservices", icon: FaTools },
        { label: "How it Works", path: "/how", icon: FaQuestionCircle },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled 
            ? "bg-white/95 backdrop-blur-md shadow-lg" 
            : "bg-white shadow-sm"
          }
        `}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 flex-shrink-0"
            >
              <img 
                src={logo} 
                alt="Logo" 
                className="h-8 sm:h-10 w-auto object-contain" 
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className={`
                    relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                    ${isActive(link.path)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors hidden sm:flex"
              >
                <FaSearch className="w-5 h-5" />
              </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors hidden sm:flex">
                    <FaBell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>

                  {/* User Profile Dropdown */}
                  <div className="relative hidden lg:block">
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
                        ${isUserDropdownOpen 
                          ? "bg-gray-100" 
                          : "hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="text-left hidden xl:block">
                        <p className="text-sm font-semibold text-gray-800 capitalize truncate max-w-[120px]">
                          {user?.full_name || "resident"}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user?.role || "serciceProvider"}
                        </p>
                      
                      </div>
                        
                      <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isUserDropdownOpen && (
                      <UserDropdown
                        user={user}
                        onLogout={handleLogout}
                        onClose={() => setIsUserDropdownOpen(false)}
                      />
                    )}
                  </div>
                </>
              ) : (
                /* Auth Buttons for Desktop */
                <div className="hidden lg:flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-gray-700 font-medium hover:text-gray-900 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    Get Started
                  </Link>

                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaBars className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar (Expandable) */}
        {isSearchOpen && (
          <div className="border-t border-gray-100 py-3 px-4 bg-white animate-fadeIn">
            <div className="container mx-auto max-w-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for services, providers..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
        navLinks={navLinks}
      />

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}