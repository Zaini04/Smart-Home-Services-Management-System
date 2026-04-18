import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaHome, FaSearch, FaBell, FaClipboardList, FaWallet,
  FaUser, FaEdit, FaSignOutAlt, FaExclamationCircle,
  FaStar, FaTimes, FaBars, FaChevronRight, FaTools,
  FaChevronDown, FaIdCard, FaShieldAlt, FaLock,
  FaComments, FaCalendarAlt, FaPlus, FaCog, FaHeadset, FaArrowLeft
} from "react-icons/fa";
import { buildMediaUrl, getApiBaseUrl } from "../../utils/url";
import { io } from "socket.io-client";
import NotificationDrawer from "../../components/NotificationDrawer";
import CalendarDrawer from "../../components/CalendarDrawer";

/* ─────────────────────────────────────────
   ALL POSSIBLE NAV ITEMS FOR RESIDENT
───────────────────────────────────────── */
const navItems = [
  { to: "/post-job",                icon: FaPlus,           label: "Book a Service", highlight: true },
  { to: "/my-bookings",             icon: FaClipboardList,  label: "My Bookings" },
  { to: "/chat",                    icon: FaComments,       label: "Messages" }, 
  { action: "calendar",             icon: FaCalendarAlt,    label: "Calendar" },
  { action: "notifications",        icon: FaBell,           label: "Notifications" },
  { to: "/profile",                 icon: FaUser,           label: "My Profile" },
  { to: "/settings",                icon: FaCog,            label: "Settings" },
  { to: "/support",                 icon: FaHeadset,        label: "Support" },
];

/* ─────────────────────────────────────────
   SIDEBAR CONTENT
───────────────────────────────────────── */
function SidebarContent({ user, onClose, hasNewNotifications, hasNewBookings, onOpenDrawer }) {
  const navigate   = useNavigate();
  const { logoutUser } = useAuth();

  const dynamicItems = navItems.map(item => {
    if (item.action === "notifications" && hasNewNotifications) return { ...item, dot: true };
    if (item.to === "/my-bookings" && hasNewBookings) return { ...item, dot: true };
    return item;
  });
  
  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">

      {/* ── Brand Header ── */}
      <div className="flex-shrink-0 px-4 pt-5 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <FaHome className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">
                ResidentPanel
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Control Center</p>
            </div>
          </div>
          {onClose && (
            <button
               onClick={onClose}
               className="p-1.5 rounded-xl hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <FaTimes className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* ── Profile Row ── */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800 border-2 border-gray-700
                          flex-shrink-0 flex items-center justify-center font-bold text-gray-300">
            {user?.full_name?.charAt(0)?.toUpperCase() || "H"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm truncate leading-none">
              {user?.full_name || "Resident"}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider
                             px-2 py-0.5 rounded-full mt-1.5 bg-blue-900/40 text-blue-300 border border-blue-800">
              Homeowner
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav flex-1 overflow-y-auto px-3 py-3 min-h-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Navigation
        </p>

        <div className="space-y-0.5">
          {dynamicItems.map((item, idx) => {
            const Icon = item.icon;

            // Handle Drawer Actions
            if (item.action) {
              return (
                <button
                  key={`btn-${idx}`}
                  onClick={() => {
                    onOpenDrawer(item.action);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-gray-300 hover:bg-gray-800 hover:text-white`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-white" />
                  <span className="font-medium text-sm flex-1 truncate text-left">
                    {item.label}
                  </span>
                  {item.dot && (
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" />
                  )}
                </button>
              );
            }

            // Normal Navigation Link
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                   duration-200 group ${
                    isActive
                      ? "bg-yellow-500 text-gray-900 shadow-md font-bold"
                      : item.highlight
                      ? "bg-gray-800 text-yellow-500 border border-gray-700 hover:bg-gray-700"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? "text-gray-900"
                        : item.highlight ? "text-yellow-500"
                        : "text-gray-500 group-hover:text-white"
                    }`} />
                    <span className="font-medium text-sm flex-1 truncate">
                      {item.label}
                    </span>
                    {item.dot && (
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" />
                    )}
                    {isActive && (
                      <FaChevronRight className="w-3 h-3 text-white/60 flex-shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="flex-shrink-0 px-3 pb-4 pt-3 border-t border-gray-800 space-y-1">
        {/* Back to Home */}
        <Link
          to="/"
          onClick={onClose}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400
                     hover:bg-gray-800 hover:text-white transition-colors group"
        >
          <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium text-sm">Back to Home</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400
                     hover:bg-red-900/50 hover:text-red-300 transition-colors group"
        >
          <FaSignOutAlt className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   RESIDENT NAVBAR (Header)
───────────────────────────────────────── */
function ResidentNavbar({ onHamburgerClick, user, onOpenDrawer, hasNewNotifications, hasNewBookings }) {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* Current page label mapping */
  const getPageTitle = () => {
    if (location.pathname.startsWith("/post-job")) return "Book a Service";
    if (location.pathname.startsWith("/my-bookings")) return "My Bookings";
    if (location.pathname.startsWith("/chat")) return "Messages";
    if (location.pathname.startsWith("/profile")) return "My Profile";
    if (location.pathname.startsWith("/settings")) return "Settings";
    if (location.pathname.startsWith("/support")) return "Support";
    return "Dashboard";
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("#res-navbar-dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="flex-shrink-0 h-16 bg-white border-b border-gray-100 flex
                       items-center px-4 lg:px-6 gap-3 shadow-sm z-20 relative">

      {/* Hamburger — mobile only */}
      <button
        onClick={onHamburgerClick}
        className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center
                   rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <FaBars className="w-4 h-4 text-gray-600" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-gray-800 text-base leading-tight truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* ── Right side ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        <Link to="/post-job" className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
          <FaPlus className="w-3 h-3" /> Book Now
        </Link>
        <span className="hidden sm:block w-px h-6 bg-gray-200 mx-2"></span>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-1.5 relative cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={() => onOpenDrawer("notifications")}>
          <FaBell className="w-4 h-4 text-gray-600" />
          {hasNewNotifications && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
        </div>
        
        <div className="flex items-center gap-1.5 relative cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={() => onOpenDrawer("calendar")}>
          <FaCalendarAlt className="w-4 h-4 text-gray-600" />
        </div>

        {/* Profile dropdown button */}
        <div className="relative ml-2" id="res-navbar-dropdown">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50
                       border border-gray-200 hover:border-gray-300 transition-all"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center font-bold text-indigo-700 bg-indigo-100 border border-gray-200 flex-shrink-0">
               {user?.full_name?.charAt(0)?.toUpperCase()}
            </div>

            <div className="hidden sm:block text-left max-w-28">
              <p className="font-semibold text-gray-800 text-sm leading-none truncate">
                {user?.full_name || "Loading..."}
              </p>
            </div>

            <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl
                            shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-gray-100">
                <p className="font-bold text-gray-800 text-sm truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                 <Link to="/my-bookings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><FaClipboardList className="w-4 h-4 text-gray-400" /> My Bookings</Link>
                 <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><FaUser className="w-4 h-4 text-gray-400" /> Profile</Link>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 pt-1 mt-1 pb-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                             text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────
   RESIDENT LAYOUT — MAIN EXPORT
───────────────────────────────────────── */
export default function ResidentLayout() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen]   = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [hasNewBookings, setHasNewBookings] = useState(false);
  
  // Drawer states
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [calendarDrawerOpen, setCalendarDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "resident") { 
      navigate("/login"); 
      return; 
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
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
  }, [user]);

  useEffect(() => {
    const path = location.pathname;
    // We clear notification dot either when they open drawer OR visit a hard URL if they somehow do
    if (path.startsWith("/notifications") || notificationDrawerOpen) setHasNewNotifications(false);
    if (path.startsWith("/my-bookings") || path.startsWith("/booking")) setHasNewBookings(false);
  }, [location.pathname, notificationDrawerOpen]);

  /* Close mobile sidebar on route change */
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleOpenDrawer = (action) => {
    if (action === "notifications") setNotificationDrawerOpen(true);
    if (action === "calendar") setCalendarDrawerOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0
                        h-screen overflow-hidden border-r border-gray-100 shadow-sm">
        <SidebarContent
          user={user}
          hasNewNotifications={hasNewNotifications}
          hasNewBookings={hasNewBookings}
          onOpenDrawer={handleOpenDrawer}
        />
      </aside>

      {/* ── Mobile Drawer ── */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${mobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
        <aside className={`absolute left-0 top-0 bottom-0 w-72 flex flex-col h-full overflow-hidden shadow-2xl bg-white transform transition-transform duration-300 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <SidebarContent
              user={user}
              onClose={() => setMobileSidebarOpen(false)}
              hasNewNotifications={hasNewNotifications}
              hasNewBookings={hasNewBookings}
            onOpenDrawer={handleOpenDrawer}
          />
        </aside>
      </div>

      {/* ── Right: Navbar + scrollable content ── */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <ResidentNavbar
          onHamburgerClick={() => setMobileSidebarOpen(true)}
          user={user}
          hasNewNotifications={hasNewNotifications}
          hasNewBookings={hasNewBookings}
          onOpenDrawer={handleOpenDrawer}
        />

        {/* ONLY this area scrolls */}
        <main className="flex-1 overflow-y-auto bg-gray-50 z-0">
          <div className="p-4 lg:p-6 xl:p-8">
             {/* If user visits /, they should probably redirect to /my-bookings within ResidentRoute */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modals/Drawers mounted globally over Layout */}
      <NotificationDrawer 
        isOpen={notificationDrawerOpen} 
        onClose={() => setNotificationDrawerOpen(false)} 
      />
      
      <CalendarDrawer 
        isOpen={calendarDrawerOpen} 
        onClose={() => setCalendarDrawerOpen(false)} 
      />

    </div>
  );
}
