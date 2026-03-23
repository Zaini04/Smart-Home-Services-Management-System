import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaPlus,
  FaTags,
  FaLayerGroup,
  FaUserClock,
  FaClipboardCheck,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaSearch,
  FaChevronDown,
  FaShieldAlt,
  FaCog,
  FaQuestionCircle,
  FaChartLine,
  FaUsers,
  FaTools,
  FaMoneyBillWave,
} from "react-icons/fa";
import { logout } from "../../api/authorEndPoints";

/* ------------------ SIDEBAR COMPONENT ------------------ */

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const menuGroups = [
    {
      title: "Overview",
      items: [
        { icon: FaHome, label: "Dashboard", path: "/admin/dashboard" },
        { icon: FaChartLine, label: "Analytics", path: "/admin/analytics" },
      ],
    },
    {
      title: "Categories",
      items: [
        { icon: FaTags, label: "Categories", path: "/admin/create-category" },
        { icon: FaLayerGroup, label: "Subcategories", path: "/admin/create-subcategory" },
      ],
    },
    {
  title: "Platform",
  items: [
    { icon: FaMoneyBillWave, label: "Platform Earnings", path: "/admin/platform-earnings" },
    { icon: FaClipboardCheck, label: "Transactions", path: "/admin/platform-transactions" },
  ],
},
    {
      title: "Workers",
      items: [
        { icon: FaUserClock, label: "Pending Workers", path: "/admin/pending-workers" },
        { icon: FaUsers, label: "All Providers", path: "/admin/all-workers" },
      ],
    },
    {
      title: "Settings",
      items: [
        { icon: FaCog, label: "Settings", path: "/admin/settings" },
        { icon: FaQuestionCircle, label: "Help", path: "/admin/help" },
      ],
    },
  ];

  const handleLogout =async () => {
    try {
      await logout()

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      navigate("/login");
      
    } catch (error) {
      console.log(error)
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-200
          z-50 transform transition-transform duration-300 lg:transform-none overflow-hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FaShieldAlt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Service Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuGroups.map((group, index) => (
            <div key={index}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
              {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate capitalize">
                {user?.full_name || "Admin"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email || "admin@example.com"}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <FaSignOutAlt className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

/* ------------------ HEADER COMPONENT ------------------ */

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    const titles = {
      dashboard: "Dashboard",
      analytics: "Analytics",
       "platform-earnings": "Platform Earnings",
      "platform-transactions": "Transactions",
      "create-category": "Categories",
      "create-subcategory": "Subcategories",
      "pending-workers": "Pending Workers",
      "update-kyc": "KYC Review",
    };
    return titles[path] || "Dashboard";
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FaBars className="w-5 h-5 text-gray-600" />
          </button>

          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:block relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-11 pr-4 py-2.5 w-64 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Notifications */}
          {/* <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
            <FaBell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button> */}

          {/* Quick Add */}
         
        </div>
      </div>
    </header>
  );
};

/* ------------------ MAIN LAYOUT COMPONENT ------------------ */

export default function AdminHomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/50 py-4 px-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Service Hub Admin. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}