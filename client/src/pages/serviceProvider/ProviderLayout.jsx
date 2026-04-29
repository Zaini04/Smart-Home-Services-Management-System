// providerLayout/ProviderLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProviderDashboard } from "../../api/serviceProviderEndPoints";
import { getApiBaseUrl } from "../../utils/url";
import { useSocket } from "../../context/SocketContext";
import { io } from "socket.io-client";
import NotificationDrawer from "../../components/shared/NotificationDrawer";
import CalendarDrawer from "../../components/shared/CalendarDrawer";
import KycGuard from "../../components/serviceProvider/providerLayout/KycGuard";
import ProviderSidebar from "../../components/serviceProvider/providerLayout/ProviderSidebar";
import ProviderNavbar from "../../components/serviceProvider/providerLayout/ProviderNavbar";

export default function ProviderLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [provider, setProvider] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(null);
  const [layoutLoading, setLayoutLoading] = useState(true);

  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [hasNewJobs, setHasNewJobs] = useState(false);
  const { unreadMessages, setUnreadMessages } = useSocket() || { unreadMessages: 0, setUnreadMessages: () => {} };

  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [calendarDrawerOpen, setCalendarDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchProvider();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    const socket = io(getApiBaseUrl(), { auth: { token }, withCredentials: true, transports: ["websocket", "polling"] });
    socket.on("notification", () => setHasNewNotifications(true));
    socket.on("data_updated", () => setHasNewJobs(true));
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/provider/notifications") || notificationDrawerOpen) setHasNewNotifications(false);
    if (path.startsWith("/provider/my-jobs") || path.startsWith("/provider/available-jobs") || path.startsWith("/provider/job")) setHasNewJobs(false);
    if (path.startsWith("/provider/chat")) setUnreadMessages(0);
  }, [location.pathname, notificationDrawerOpen]);

  const handleOpenDrawer = (action) => {
    if (action === "notifications") setNotificationDrawerOpen(true);
    if (action === "calendar") setCalendarDrawerOpen(true);
  };

  const fetchProvider = async () => {
    try {
      setLayoutLoading(true);
      const res = await getProviderDashboard();
      const data = res.data.data;
      setProvider(data?.provider || null);
      setKycStatus(data?.provider?.kycStatus || "pending");
      setProfileCompleted(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setKycStatus(err.response?.data?.kycStatus || "pending");
        setProfileCompleted(true);
        setProvider(err.response?.data?.provider || null);
      } else if (status === 404) {
        setProfileCompleted(false);
        setKycStatus("pending");
      } else {
        setProfileCompleted(false);
        setKycStatus("pending");
      }
    } finally {
      setLayoutLoading(false);
    }
  };

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  if (layoutLoading || profileCompleted === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <KycGuard profileCompleted={profileCompleted} kycStatus={kycStatus} />

      <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 h-screen overflow-hidden border-r border-gray-100 shadow-sm">
        <ProviderSidebar user={user} provider={provider} profileCompleted={profileCompleted} kycStatus={kycStatus} hasNewNotifications={hasNewNotifications} hasNewJobs={hasNewJobs} unreadMessages={unreadMessages} onOpenDrawer={handleOpenDrawer} />
      </aside>

      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${mobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
        <aside className={`absolute left-0 top-0 bottom-0 w-72 flex flex-col h-full overflow-hidden shadow-2xl bg-white transform transition-transform duration-300 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <ProviderSidebar user={user} onClose={() => setMobileSidebarOpen(false)} provider={provider} profileCompleted={profileCompleted} kycStatus={kycStatus} hasNewNotifications={hasNewNotifications} hasNewJobs={hasNewJobs} unreadMessages={unreadMessages} onOpenDrawer={handleOpenDrawer} />
        </aside>
      </div>

      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <ProviderNavbar onHamburgerClick={() => setMobileSidebarOpen(true)} user={user} provider={provider} profileCompleted={profileCompleted} kycStatus={kycStatus} hasNewNotifications={hasNewNotifications} hasNewJobs={hasNewJobs} unreadMessages={unreadMessages} onOpenDrawer={handleOpenDrawer} />
        <main className="flex-1 overflow-y-auto bg-gray-50 z-0 relative">
          <div className="p-4 lg:p-6 xl:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      <NotificationDrawer isOpen={notificationDrawerOpen} onClose={() => setNotificationDrawerOpen(false)} />
      <CalendarDrawer isOpen={calendarDrawerOpen} onClose={() => setCalendarDrawerOpen(false)} />
    </div>
  );
}

