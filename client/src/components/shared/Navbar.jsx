// components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo (3).png";
import {
  FaBars,
  FaChevronDown,
  FaPlus,
  FaBell,
  FaCalendarAlt,
  FaComments,
  FaHome,
  FaStar,
  FaQuestionCircle,
  FaInfoCircle,
  FaEnvelope,
} from "react-icons/fa";
import { useNavbar } from "../../hooks/useNavbar";
import LoginPromptModal from "./LoginPromptModal";
import UserDropdown from "./UserDropdown";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const navigate = useNavigate();
  const {
    isScrolled,
    isMobileMenuOpen, setIsMobileMenuOpen,
    isUserDropdownOpen, setIsUserDropdownOpen,
    showLoginPrompt, setShowLoginPrompt,
    unreadMessages,
    hasNewNotifications,
    hasNewBookings,
    isLoggedIn,
    user,
    handleLogout,
    handleBookService,
    scrollToSection,
    isActive,
  } = useNavbar();

  const navLinks = [
    { label: "Home",         path: "/",       icon: FaHome },
    { label: "Features",     scrollTo: "features", icon: FaStar },
    { label: "How it Works", scrollTo: "how",      icon: FaQuestionCircle },
    { label: "About Us",     scrollTo: "about",    icon: FaInfoCircle },
    { label: "Contact",      scrollTo: "contact",  icon: FaEnvelope },
  ];

  const enrichedUser = user
    ? { ...user, hasNewBookings, hasNewNotifications }
    : null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-white/10 text-white"
            : "bg-transparent text-gray-800"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src={logo}
                alt="Logo"
                className={`h-8 sm:h-10 w-auto object-contain transition-all ${
                  isScrolled ? "brightness-0 invert" : ""
                }`}
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, index) =>
                link.scrollTo ? (
                  <button
                    key={index}
                    onClick={() => scrollToSection(link.scrollTo)}
                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isScrolled
                        ? "text-gray-300 hover:text-white hover:bg-white/10"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={index}
                    to={link.path}
                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                      isActive(link.path)
                        ? isScrolled
                          ? "text-yellow-400 bg-white/10"
                          : "text-blue-600 bg-blue-50"
                        : isScrolled
                        ? "text-gray-300 hover:text-white hover:bg-white/10"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                    {isActive(link.path) && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                )
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Book a Service Button */}
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
                  {/* Messages — mobile only */}
                  {/* <Link
                    to="/chat"
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors sm:hidden"
                  >
                    <FaComments className="w-5 h-5" />
                    {unreadMessages > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadMessages > 9 ? "9" : unreadMessages}
                      </span>
                    )}
                  </Link> */}

                  {/* Notifications */}
                  {/* <button
                    onClick={() => navigate("/notifications")}
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex"
                  >
                    <FaBell className="w-5 h-5" />
                    {hasNewNotifications && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button> */}

                  {/* Calendar */}
                  {/* <button
                    onClick={() => navigate("/calendar")}
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex"
                  >
                    <FaCalendarAlt className="w-5 h-5" />
                  </button> */}

                  {/* User Dropdown — desktop only */}
                  <div className="relative hidden lg:block">
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                        isScrolled
                          ? isUserDropdownOpen ? "bg-white/10" : "hover:bg-white/10"
                          : isUserDropdownOpen ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="text-left hidden xl:block">
                        <p className={`text-sm font-semibold capitalize truncate max-w-[120px] ${
                          isScrolled ? "text-gray-100" : "text-gray-800"
                        }`}>
                          {user?.full_name || "User"}
                        </p>
                        <p className={`text-xs ${isScrolled ? "text-gray-400" : "text-gray-500"}`}>
                          Resident
                        </p>
                      </div>
                      <FaChevronDown
                        className={`w-3 h-3 text-gray-400 transition-transform ${
                          isUserDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isUserDropdownOpen && (
                      <UserDropdown
                        user={enrichedUser}
                        onLogout={handleLogout}
                        onClose={() => setIsUserDropdownOpen(false)}
                        unreadMessages={unreadMessages}
                      />
                    )}
                  </div>
                </>
              ) : (
                /* Auth Buttons — desktop only */
                <div className="hidden lg:flex items-center gap-3">
                  <Link
                    to="/login"
                    className={`px-5 py-2.5 font-medium transition-colors ${
                      isScrolled
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-700 hover:text-gray-900"
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

              {/* Hamburger — mobile only */}
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

      {/* Spacer */}
      <div className="h-16 lg:h-20" />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={enrichedUser}
        onLogout={handleLogout}
        navLinks={navLinks}
        onScrollTo={scrollToSection}
        unreadMessages={unreadMessages}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-fadeIn  { animation: fadeIn  0.2s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </>
  );
}
