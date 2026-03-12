import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaHome, FaSearch, FaBell, FaBriefcase, FaWallet,
  FaUser, FaEdit, FaSignOutAlt, FaExclamationCircle,
  FaStar, FaTimes, FaBars, FaChevronRight, FaTools,
  FaChevronDown, FaIdCard, FaShieldAlt, FaLock,
  FaComments,
  FaMoneyBill,
  FaMoneyBillWave,
} from "react-icons/fa";
import { getProviderDashboard } from "../../api/serviceProviderEndPoints";

/* ─────────────────────────────────────────
   ALL POSSIBLE NAV ITEMS
───────────────────────────────────────── */
const approvedNavItems = [
  { to: "/provider/dashboard",      icon: FaHome,      label: "Dashboard",      end: true },
  { to: "/provider/available-jobs", icon: FaSearch,    label: "Available Jobs", badge: "New" },
  { to: "/provider/my-offers",      icon: FaBell,      label: "My Offers" },
  { to: "/provider/my-jobs",        icon: FaBriefcase, label: "My Jobs" },
  { to: "/provider/messages",       icon: FaComments,  label: "Messages" },  // ← ADD THIS
  { to: "/provider/wallet",         icon: FaWallet,    label: "Wallet" },      // ← ADD
  { to: "/provider/earnings",       icon: FaMoneyBillWave,    label: "Earnings" },
  { to: "/provider/profile",        icon: FaUser,      label: "My Profile" },
  { to: "/provider/edit-profile",   icon: FaEdit,      label: "Edit Profile" },
];

/* ─────────────────────────────────────────
   GET NAV ITEMS based on kyc state
───────────────────────────────────────── */
function getNavItems(profileCompleted, kycStatus) {
  if (!profileCompleted) {
    return [{
      to: "/provider/complete-profile",
      icon: FaIdCard,
      label: "Complete Profile",
      highlight: true,
    }];
  }
  if (kycStatus === "pending") {
    return [{
      to: "/provider/kyc-status",
      icon: FaShieldAlt,
      label: "KYC Status",
    }];
  }
  if (kycStatus === "rejected") {
    return [
      { to: "/provider/kyc-status",     icon: FaShieldAlt, label: "KYC Status" },
      { to: "/provider/edit-profile",   icon: FaEdit,      label: "Edit Profile" },
    ];
  }
  // approved
  return approvedNavItems;
}

/* ─────────────────────────────────────────
   KYC GUARD
───────────────────────────────────────── */
function KycGuard({ profileCompleted, kycStatus }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;

    if (!profileCompleted) {
      if (path !== "/provider/complete-profile") {
        navigate("/provider/complete-profile", { replace: true });
      }
      return;
    }

    if (kycStatus === "pending") {
      const allowed = ["/provider/kyc-status"];
      if (!allowed.some((a) => path.startsWith(a))) {
        navigate("/provider/kyc-status", { replace: true });
      }
      return;
    }

    if (kycStatus === "rejected") {
      const allowed = ["/provider/kyc-status", "/provider/edit-profile"];
      if (!allowed.some((a) => path.startsWith(a))) {
        navigate("/provider/kyc-status", { replace: true });
      }
      return;
    }

    if (kycStatus === "approved") {
      const blocked = ["/provider/complete-profile", "/provider/kyc-status"];
      if (blocked.some((b) => path.startsWith(b))) {
        navigate("/provider/dashboard", { replace: true });
      }
    }
  }, [location.pathname, profileCompleted, kycStatus]);

  return null;
}

/* ─────────────────────────────────────────
   SIDEBAR CONTENT
   Compact — more space for nav links
───────────────────────────────────────── */
function SidebarContent({ provider, profileCompleted, kycStatus, onClose }) {
  const navigate   = useNavigate();
  const { logoutUser } = useAuth();

  const navItems = getNavItems(profileCompleted, kycStatus);
  
  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Brand Header — compact ── */}
      <div className="flex-shrink-0 px-4 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600
                            rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <FaTools className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-none">
                WorkerPanel
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Service Provider</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <FaTimes className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* ── Compact Profile Row ── */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Small avatar */}
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br
                          from-blue-100 to-indigo-100 border-2 border-blue-200
                          flex-shrink-0">
            {provider?.profileImage ? (
              <img
                src={`${import.meta.env.VITE_BASE_URL}/${provider.profileImage}`}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaUser className="w-4 h-4 text-blue-500" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800 text-sm truncate leading-none">
              {provider?.name || "Provider"}
            </p>
            {/* KYC Status pill */}
            <span className={`inline-flex items-center gap-1 text-xs font-medium
                             px-2 py-0.5 rounded-full mt-1 ${
              kycStatus === "approved"
                ? "bg-green-100 text-green-700"
                : kycStatus === "rejected"
                ? "bg-red-100 text-red-700"
                : !profileCompleted
                ? "bg-gray-100 text-gray-600"
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {kycStatus === "approved" ? "✓ Approved"
                : kycStatus === "rejected" ? "✗ Rejected"
                : !profileCompleted ? "● Setup Required"
                : "⏳ Under Review"}
            </span>
          </div>
        </div>

        {/* Context message — only when not approved */}
        {kycStatus !== "approved" && (
          <div className={`mt-3 rounded-xl px-3 py-2 text-xs leading-relaxed ${
            !profileCompleted
              ? "bg-blue-50 text-blue-800 border border-blue-100"
              : kycStatus === "rejected"
              ? "bg-red-50 text-red-700 border border-red-100"
              : "bg-yellow-50 text-yellow-800 border border-yellow-100"
          }`}>
            {!profileCompleted
              ? "Complete your profile to unlock all features."
              : kycStatus === "rejected"
              ? "Profile rejected. Update and resubmit."
              : "Profile is under review. Usually 24–48 hours."}
          </div>
        )}
      </div>

      {/* ── Navigation — takes all remaining space, scrolls independently ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider
                      px-3 mb-2">
          {kycStatus === "approved" ? "Navigation" : "Account Setup"}
        </p>

        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                   duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : item.highlight
                      ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? "text-white"
                        : item.highlight ? "text-blue-600"
                        : "text-gray-400 group-hover:text-blue-500"
                    }`} />
                    <span className="font-medium text-sm flex-1 truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full
                                       font-semibold flex-shrink-0 ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-blue-100 text-blue-600"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && !isActive && (
                      <FaChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0 animate-pulse" />
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

        {/* Locked info card inside nav */}
        {kycStatus !== "approved" && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <FaLock className="w-3 h-3 text-gray-400" />
              <p className="text-xs font-semibold text-gray-500">
                Pages Locked
              </p>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {!profileCompleted
                ? "Complete profile setup to unlock Dashboard, Jobs, Offers and more."
                : kycStatus === "rejected"
                ? "Fix your profile and resubmit to unlock all features."
                : "All pages unlock once admin approves your profile."}
            </p>
          </div>
        )}
      </nav>

      {/* ── Footer ── */}
      <div className="flex-shrink-0 px-3 pb-4 pt-3 border-t border-gray-100 space-y-2">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-3
                        border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
              <FaExclamationCircle className="w-3 h-3 text-white" />
            </div>
            <p className="font-semibold text-gray-800 text-xs">Need Help?</p>
          </div>
          <p className="text-xs text-gray-500 mb-2 leading-relaxed">
            Contact support for assistance.
          </p>
          <button className="w-full py-1.5 bg-blue-600 text-white text-xs font-semibold
                             rounded-lg hover:bg-blue-700 transition-colors">
            Get Support
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500
                     hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
          <FaSignOutAlt className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PROVIDER NAVBAR
   Right side: Name | Rating | Wallet | Dropdown arrow
───────────────────────────────────────── */
function ProviderNavbar({ onHamburgerClick, provider, profileCompleted, kycStatus }) {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = getNavItems(profileCompleted, kycStatus);

  /* Current page label */
  const allItems = [
    ...approvedNavItems,
    { to: "/provider/complete-profile", label: "Complete Profile" },
    { to: "/provider/kyc-status",       label: "KYC Status" },
  ];
  const currentPage = allItems.find((n) =>
    n.end
      ? location.pathname === n.to
      : location.pathname.startsWith(n.to)
  )?.label || "Dashboard";

  /* Dates */
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const todayShort = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("#prov-navbar-dropdown")) {
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

      {/* Page title + date */}
      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-gray-800 text-base leading-tight truncate">
          {currentPage}
        </h1>
        <p className="text-xs text-gray-400 hidden sm:block truncate">{today}</p>
        <p className="text-xs text-gray-400 sm:hidden">{todayShort}</p>
      </div>

      {/* ── Right side: Rating + Wallet + Name + Photo + dropdown ── */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Rating pill — only when approved */}
        {kycStatus === "approved" && provider?.rating !== undefined && (
          <div className="hidden md:flex items-center gap-1.5 bg-yellow-50 border
                          border-yellow-200 rounded-xl px-3 py-1.5">
            <FaStar className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-sm font-bold text-gray-800">
              {provider.rating?.toFixed(1) || "0.0"}
            </span>
          </div>
        )}

        {/* Wallet pill — only when approved */}
        {kycStatus === "approved" && (
          <div className="hidden md:flex items-center gap-1.5 bg-green-50 border
                          border-green-200 rounded-xl px-3 py-1.5">
            <FaWallet className="w-3.5 h-3.5 text-green-600" />
            <span className="text-sm font-bold text-green-700">
              Rs. {(provider?.walletBalance || 0).toLocaleString()}
            </span>
          </div>
        )}

        {/* Profile dropdown button */}
        <div className="relative" id="prov-navbar-dropdown">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50
                       border border-gray-200 hover:border-gray-300 transition-all"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br
                            from-blue-100 to-indigo-100 border border-gray-200 flex-shrink-0">
              {provider?.profileImage ? (
                <img
                  src={`${import.meta.env.VITE_BASE_URL}/${provider.profileImage}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaUser className="w-4 h-4 text-blue-500" />
                </div>
              )}
            </div>

            {/* Name (not "Provider") */}
            <div className="hidden sm:block text-left max-w-28">
              <p className="font-semibold text-gray-800 text-sm leading-none truncate">
                {provider?.name || "Loading..."}
              </p>
              <p className={`text-xs mt-0.5 leading-none ${
                kycStatus === "approved" ? "text-green-500"
                  : kycStatus === "rejected" ? "text-red-500"
                  : "text-yellow-500"
              }`}>
                {kycStatus === "approved" ? "✓ Approved"
                  : kycStatus === "rejected" ? "✗ Rejected"
                  : !profileCompleted ? "Setup Required"
                  : "Under Review"}
              </p>
            </div>

            <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform
                                      duration-200 flex-shrink-0 ${
              dropdownOpen ? "rotate-180" : ""
            }`} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl
                            shadow-xl border border-gray-100 overflow-hidden z-50">

              {/* Dropdown header */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50
                              border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-white
                                  border-2 border-blue-200 flex-shrink-0">
                    {provider?.profileImage ? (
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}/${provider.profileImage}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FaUser className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">
                      {provider?.name || "Provider"}
                    </p>
                    {/* Show rating + wallet in dropdown header when approved */}
                    {kycStatus === "approved" && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <FaStar className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs font-semibold text-gray-700">
                            {provider?.rating?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1">
                          <FaWallet className="w-3 h-3 text-green-500" />
                          <span className="text-xs font-semibold text-green-600">
                            Rs. {(provider?.walletBalance || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* KYC badge */}
                    {kycStatus !== "approved" && (
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5
                                       rounded-full mt-1 ${
                        kycStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : !profileCompleted
                          ? "bg-gray-200 text-gray-600"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {kycStatus === "rejected" ? "✗ Rejected"
                          : !profileCompleted ? "Setup Required"
                          : "⏳ Under Review"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Nav links — only what's allowed */}
              <div className="py-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setDropdownOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : item.highlight
                            ? "text-blue-700 hover:bg-blue-50 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2
                                         py-0.5 rounded-full font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
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
   PROVIDER LAYOUT — MAIN EXPORT
───────────────────────────────────────── */
export default function ProviderLayout() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen]   = useState(false);
  const [provider, setProvider]                     = useState(null);
  const [kycStatus, setKycStatus]                   = useState(null);
  const [profileCompleted, setProfileCompleted]     = useState(null);
  const [layoutLoading, setLayoutLoading]           = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchProvider();
  }, [user]);

  const fetchProvider = async () => {
    try {
      setLayoutLoading(true);
      const res  = await getProviderDashboard();
      const data = res.data.data;
      console.log("Provider dashboard data:", data);
      setProvider(data?.provider || null);

      const status = data?.provider?.kycStatus || "pending";
      setKycStatus(status);
      setProfileCompleted(true);
    } catch (err) {
      const status = err.response?.status;

      if (status === 403) {
        /*
          403 = provider profile exists but KYC not approved.
          Backend should ideally return kycStatus in error body.
        */
        const serverKyc = err.response?.data?.kycStatus || "pending";
        setKycStatus(serverKyc);
        setProfileCompleted(true);
        /* Try to get provider name at minimum */
        setProvider(err.response?.data?.provider || null);
      } else if (status === 404) {
        /* Provider profile doesn't exist at all */
        setProfileCompleted(false);
        setKycStatus("pending");
      } else {
        /* Network error etc. — default safe state */
        setProfileCompleted(false);
        setKycStatus("pending");
      }
    } finally {
      setLayoutLoading(false);
    }
  };

  /* Close mobile sidebar on route change */
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  /* Loading screen */
  if (layoutLoading || profileCompleted === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent
                          rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Route guard */}
      <KycGuard
        profileCompleted={profileCompleted}
        kycStatus={kycStatus}
      />

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0
                        h-screen overflow-hidden border-r border-gray-100 shadow-sm">
        <SidebarContent
          provider={provider}
          profileCompleted={profileCompleted}
          kycStatus={kycStatus}
        />
      </aside>

      {/* ── Mobile Drawer ── */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col
                            h-full overflow-hidden shadow-2xl">
            <SidebarContent
              provider={provider}
              profileCompleted={profileCompleted}
              kycStatus={kycStatus}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── Right: Navbar + scrollable content ── */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <ProviderNavbar
          onHamburgerClick={() => setMobileSidebarOpen(true)}
          provider={provider}
          profileCompleted={profileCompleted}
          kycStatus={kycStatus}
        />

        {/* ONLY this area scrolls */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 lg:p-6 xl:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}