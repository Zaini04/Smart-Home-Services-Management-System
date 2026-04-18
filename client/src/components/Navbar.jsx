// components/Navbar.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo (3).png";
import { useAuth } from "../context/AuthContext";
import { getUnreadCount } from "../api/chatEndPoints";
import { io } from "socket.io-client";
import { getApiBaseUrl } from "../utils/url";
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
  FaBell,
  FaSearch,
  FaUserCircle,
  FaClipboardList,
  FaQuestionCircle,
  FaComments,
  FaPlus,
  FaLock,
  FaArrowRight,
  FaStar,
  FaHeadset,
  FaInfoCircle,
  FaEnvelope,
} from "react-icons/fa";

/* ------------------ LOGIN PROMPT MODAL ------------------ */

const LoginPromptModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="w-8 h-8 text-blue-600" />
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
            Login Required
          </h3>
          <p className="text-gray-500 text-center mb-6">
            Please login or create an account to book a service and access all features.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                navigate("/login");
              }}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Login
              <FaArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onClose();
                navigate("/signup");
              }}
              className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Create Account
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ USER DROPDOWN COMPONENT ------------------ */

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

  // Resident-only menu items
  const menuItems = [
    { icon: FaUserCircle, label: "My Profile", link: "/profile" },
    { icon: FaClipboardList, label: "My Bookings", link: "/my-bookings", dotBadge: user?.hasNewBookings },
    { 
      icon: FaComments, 
      label: "Messages", 
      link: "/chat",
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    { icon: FaCog, label: "Settings", link: "/settings" },
    { icon: FaHeadset, label: "Help & Support", link: "/support" },
    { icon: FaCalendarAlt, label: "My Calendar", link: "/calendar" },
    { icon: FaBell, label: "Notifications", link: "/notifications", dotBadge: user?.hasNewNotifications },
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

      {/* Quick Action - Book a Service */}
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
            {item.badge && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
            {item.dotBadge && (
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block" />
            )}
          </Link>
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

const MobileMenu = ({ 
  isOpen, 
  onClose, 
  user, 
  onLogout, 
  navLinks, 
  onScrollTo,
  onBookService,
  unreadMessages,
}) => {
  if (!isOpen) return null;

  // Resident menu items for mobile
  const residentMenuItems = [
    { icon: FaClipboardList, label: "My Bookings", link: "/my-bookings", dotBadge: user?.hasNewBookings },
    { icon: FaComments, label: "Messages", link: "/chat", badge: unreadMessages },
    { icon: FaUserCircle, label: "My Profile", link: "/profile" },
    { icon: FaCog, label: "Settings", link: "/settings" },
    { icon: FaBell, label: "Notifications", link: "/notifications", dotBadge: user?.hasNewNotifications },
    { icon: FaCalendarAlt, label: "My Calendar", link: "/calendar" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Menu Panel */}
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
            {/* Book a Service Button */}
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
                if (link.scrollTo) {
                  onScrollTo(link.scrollTo);
                  onClose();
                } else {
                  onClose();
                }
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

        {/* Resident Menu Items (if logged in) */}
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
                  {item.badge > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                  {item.dotBadge && (
                     <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
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
              onClick={() => {
                onLogout();
                onClose();
              }}
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

/* ------------------ MAIN NAVBAR COMPONENT ------------------ */

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutUser, user } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [hasNewBookings, setHasNewBookings] = useState(false);

  // Check if user is a resident (not provider or admin)

  const isResident = user && user.role === "resident";
  const isLoggedIn = !!user;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Notifications live listeners
  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = io(getApiBaseUrl(), {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("notification", () => setHasNewNotifications(true));
    socket.on("data_updated", () => setHasNewBookings(true));

    return () => socket.disconnect();
  }, [isLoggedIn]);

  // Clear live dots when visiting the relevant pages
  useEffect(() => {
    if (location.pathname.startsWith("/notifications")) setHasNewNotifications(false);
    if (location.pathname.startsWith("/my-bookings") || location.pathname.startsWith("/booking")) setHasNewBookings(false);
  }, [location.pathname]);

  // Close mobile menu on route change

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Fetch unread messages count
  useEffect(() => {
    if (isLoggedIn && isResident) {
      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, isResident]);
  
  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadMessages(res.data.data?.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsUserDropdownOpen(false);
    navigate("/");
  };

  // Handle "Book a Service" click
  const handleBookService = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
    } else {
      navigate("/post-job");
    }
  };

  // Scroll to section (for landing page navigation)
  const scrollToSection = (sectionId) => {
    // If we're on the landing page, scroll directly
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Navigate to landing page with hash
      navigate(`/#${sectionId}`);
    }
  };

  // Handle hash scrolling when navigating from another page
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location]);

  // Navigation links based on login status
  const navLinks = [
    { label: "Home",       path: "/",        icon: FaHome },
    { label: "Features",   scrollTo: "features", icon: FaStar },
    { label: "How it Works", scrollTo: "how",   icon: FaQuestionCircle },
    { label: "About Us",   scrollTo: "about", icon: FaInfoCircle },
    { label: "Contact",    scrollTo: "contact", icon: FaEnvelope },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled 
            ? "bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-white/10 text-white" 
            : "bg-transparent text-gray-800"
          }
        `}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img 
                src={logo} 
                alt="Logo" 
                className={`h-8 sm:h-10 w-auto object-contain transition-all ${isScrolled ? 'brightness-0 invert' : ''}`} 
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, index) => (
                link.scrollTo ? (
                  // Scroll-to-section button
                  <button
                    key={index}
                    onClick={() => scrollToSection(link.scrollTo)}
                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isScrolled ? "text-gray-300 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </button>
                ) : (
                  // Regular link
                  <Link
                    key={index}
                    to={link.path}
                    className={`
                      relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2
                      ${isActive(link.path) || (link.scrollTo && location.hash === `#${link.scrollTo}`)
                        ? (isScrolled ? "text-yellow-400 bg-white/10" : "text-blue-600 bg-blue-50")
                        : (isScrolled ? "text-gray-300 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50")
                      }
                    `}
                  >
                    {link.label}
                    {link.badge > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {link.badge > 9 ? "9+" : link.badge}
                      </span>
                    )}
                    {isActive(link.path) && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                )
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Book a Service Button - Always visible */}
              <button
                onClick={handleBookService}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-yellow-500 text-gray-900 font-bold rounded-xl hover:bg-yellow-400 transition-colors text-sm shadow-lg shadow-yellow-500/20"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Book a Service</span>
                <span className="md:hidden">Book</span>
              </button>

              {isLoggedIn ? (
                <>
                  {/* Messages Icon (Mobile) */}
                  <Link
                    to="/chat"
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors sm:hidden"
                  >
                    <FaComments className="w-5 h-5" />
                    {unreadMessages > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadMessages > 9 ? "9" : unreadMessages}
                      </span>
                    )}
                  </Link>

                  {/* Notifications */}
                  <button onClick={()=>navigate('/notifications')} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors  flex">
                    <FaBell className="w-5 h-5" />
                    {hasNewNotifications && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
                  </button>
                  <button onClick={() => navigate('/calendar')} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors  flex">
                    <FaCalendarAlt className="w-5 h-5" />
                  </button>

                  {/* User Profile Dropdown */}
                  <div className="relative hidden lg:block">
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
                        ${isScrolled 
                          ? (isUserDropdownOpen ? "bg-white/10" : "hover:bg-white/10") 
                          : (isUserDropdownOpen ? "bg-gray-100" : "hover:bg-gray-50")}
                      `}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="text-left hidden xl:block">
                        <p className={`text-sm font-semibold capitalize truncate max-w-[120px] ${isScrolled ? "text-gray-100" : "text-gray-800"}`}>
                          {user?.full_name || "User"}
                        </p>
                        <p className={`text-xs ${isScrolled ? "text-gray-400" : "text-gray-500"}`}>Resident</p>
                      </div>
                      <FaChevronDown 
                        className={`w-3 h-3 text-gray-400 transition-transform ${
                          isUserDropdownOpen ? "rotate-180" : ""
                        }`} 
                      />
                    </button>

                    {isUserDropdownOpen && (
                      <UserDropdown
                        user={{ ...user, hasNewBookings, hasNewNotifications }}
                        onLogout={handleLogout}
                        onClose={() => setIsUserDropdownOpen(false)}
                        unreadMessages={unreadMessages}
                      />
                    )}
                  </div>
                </>
              ) : (
                /* Auth Buttons for Desktop */
                <div className="hidden lg:flex items-center gap-3">
                  <Link
                    to="/login"
                    className={`px-5 py-2.5 font-medium transition-colors ${
                      isScrolled ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2.5 bg-yellow-500 text-gray-900 font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
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
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user ? { ...user, hasNewBookings, hasNewNotifications } : null}
        onLogout={handleLogout}
        navLinks={navLinks}
        onScrollTo={scrollToSection}
        onBookService={handleBookService}
        unreadMessages={unreadMessages}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
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