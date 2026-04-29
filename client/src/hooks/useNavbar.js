// hooks/useNavbar.js
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import { getApiBaseUrl } from "../utils/url";
import { useSocket } from "../context/SocketContext";

export function useNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutUser, user } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { unreadMessages, setUnreadMessages } = useSocket() || { unreadMessages: 0, setUnreadMessages: () => {} };
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [hasNewBookings, setHasNewBookings] = useState(false);

  const isResident = user && user.role === "resident";
  const isLoggedIn = !!user;

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Socket: live notification + booking dots
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

  // Clear dots when visiting relevant pages
  useEffect(() => {
    if (location.pathname.startsWith("/notifications")) setHasNewNotifications(false);
    if (location.pathname.startsWith("/chat")) setUnreadMessages(0);
    if (
      location.pathname.startsWith("/my-bookings") ||
      location.pathname.startsWith("/booking")
    ) {
      setHasNewBookings(false);
    }
  }, [location.pathname]);

  // Close mobile menu on any route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Handle hash-based scrolling when navigating from another page
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location]);

  const handleLogout = () => {
    logoutUser();
    setIsUserDropdownOpen(false);
    navigate("/");
  };

  const handleBookService = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
    } else {
      navigate("/post-job");
    }
  };

  const scrollToSection = (sectionId) => {
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return {
    // State
    isScrolled,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isUserDropdownOpen,
    setIsUserDropdownOpen,
    showLoginPrompt,
    setShowLoginPrompt,
    unreadMessages,
    hasNewNotifications,
    hasNewBookings,
    // Derived
    isLoggedIn,
    user,
    // Actions
    handleLogout,
    handleBookService,
    scrollToSection,
    isActive,
  };
}
