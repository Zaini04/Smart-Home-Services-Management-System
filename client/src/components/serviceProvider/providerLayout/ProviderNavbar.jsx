// providerLayout/ProviderNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FaBars, FaStar, FaComments, FaBell, FaCalendarAlt, FaUser, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { buildMediaUrl } from "../../../utils/url";
import { getNavItems, approvedNavItems } from "./providerNavConstants";

function ProviderNavbar({ onHamburgerClick, user, provider, profileCompleted, kycStatus, hasNewNotifications, hasNewJobs, unreadMessages, onOpenDrawer }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const baseNavItems = getNavItems(profileCompleted, kycStatus);
  const navItems = baseNavItems.map(item => {
    if (item.label === "Notifications" && hasNewNotifications) return { ...item, dot: true };
    if (item.label === "Available Jobs" && hasNewJobs) return { ...item, badge: "New" };
    if (item.label === "My Jobs" && hasNewJobs) return { ...item, dot: true };
    if (item.label === "Messages" && unreadMessages > 0) return { ...item, dot: true };
    return item;
  });

  const allItems = [...approvedNavItems, { to: "/provider/complete-profile", label: "Complete Profile" }, { to: "/provider/kyc-status", label: "KYC Status" }];
  const currentPage = allItems.find((n) => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || "Dashboard";

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const todayShort = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const handleLogout = () => { setDropdownOpen(false); logoutUser(); navigate("/login"); };

  useEffect(() => {
    const handler = (e) => { if (!e.target.closest("#prov-navbar-dropdown")) setDropdownOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="flex-shrink-0 h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-3 shadow-sm z-20 relative">
      <button onClick={onHamburgerClick} className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
        <FaBars className="w-4 h-4 text-gray-600" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-gray-800 text-base leading-tight truncate">{currentPage}</h1>
        <p className="text-xs text-gray-400 hidden sm:block truncate">{today}</p>
        <p className="text-xs text-gray-400 sm:hidden">{todayShort}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {kycStatus === "approved" && provider?.rating !== undefined && (
          <div className="hidden md:flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-1.5">
            <FaStar className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-sm font-bold text-gray-800">{provider.rating?.toFixed(1) || "0.0"}</span>
          </div>
        )}

        {kycStatus === "approved" && (
          <div className="flex items-center gap-1 sm:gap-2 mr-2">
            {/* <Link to="/provider/chat" className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors sm:hidden flex">
              <FaComments className="w-5 h-5" />
              {unreadMessages > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />}
            </Link> */}
            {/* <button onClick={() => onOpenDrawer('notifications')} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex">
              <FaBell className="w-5 h-5" />
              {hasNewNotifications && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
            </button> */}
            <button onClick={() => onOpenDrawer('calendar')} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors hidden sm:flex">
              <FaCalendarAlt className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="relative" id="prov-navbar-dropdown">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border border-gray-200 flex-shrink-0">
              {provider?.profileImage ? <img src={buildMediaUrl(provider.profileImage)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FaUser className="w-4 h-4 text-blue-500" /></div>}
            </div>
            <div className="hidden sm:block text-left max-w-28">
              <p className="font-semibold text-gray-800 text-sm leading-none truncate">{user?.full_name || "Loading..."}</p>
              <p className={`text-xs mt-0.5 leading-none ${kycStatus === "approved" ? "text-green-500" : kycStatus === "rejected" ? "text-red-500" : "text-yellow-500"}`}>
                {kycStatus === "approved" ? "✓ Approved" : kycStatus === "rejected" ? "✗ Rejected" : !profileCompleted ? "Setup Required" : "Under Review"}
              </p>
            </div>
            <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="p-4 bg-blue-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border-2 border-blue-200 flex-shrink-0">
                    {provider?.profileImage ? <img src={buildMediaUrl(provider.profileImage)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100"><FaUser className="w-5 h-5 text-gray-400" /></div>}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{provider?.name || "Provider"}</p>
                    {kycStatus === "approved" && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1"><FaStar className="w-3 h-3 text-yellow-500" /><span className="text-xs font-semibold text-gray-700">{provider?.rating?.toFixed(1) || "0.0"}</span></div>
                      </div>
                    )}
                    {kycStatus !== "approved" && (
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${kycStatus === "rejected" ? "bg-red-100 text-red-700" : !profileCompleted ? "bg-gray-200 text-gray-600" : "bg-yellow-100 text-yellow-700"}`}>
                        {kycStatus === "rejected" ? "✗ Rejected" : !profileCompleted ? "Setup Required" : "⏳ Under Review"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="py-1">
                {navItems.map((item, idx) => (
                  <li key={idx} className="list-none">
                    {item.action ? (
                      <button onClick={() => { onOpenDrawer(item.action); setDropdownOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-gray-700 hover:bg-gray-50 text-sm`}>
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">{item.badge}</span>}
                        {item.dot && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 shadow-sm" />}
                      </button>
                    ) : (
                      <NavLink to={item.to} end={item.end} onClick={() => setDropdownOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? "bg-blue-50 text-blue-600 font-semibold" : item.highlight ? "text-blue-700 hover:bg-blue-50 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">{item.badge}</span>}
                        {item.dot && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 shadow-sm" />}
                      </NavLink>
                    )}
                  </li>
                ))}
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

export default ProviderNavbar;

