// residentLayout/ResidentLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";
import { getApiBaseUrl } from "../../utils/url";
import { useSocket } from "../../context/SocketContext";
import NotificationDrawer from "../../components/shared/NotificationDrawer";
import CalendarDrawer from "../../components/shared/CalendarDrawer";
import ResidentSidebar from "../../components/resident/residentLayout/ResidentSidebar";
import ResidentNavbar from "../../components/resident/residentLayout/ResidentNavbar";

export default function ResidentLayout() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen]       = useState(false);
  const [hasNewNotifications, setHasNewNotifications]   = useState(false);
  const [hasNewBookings, setHasNewBookings]             = useState(false);
  const { unreadMessages, setUnreadMessages } = useSocket() || { unreadMessages: 0, setUnreadMessages: () => {} };
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [calendarDrawerOpen, setCalendarDrawerOpen]     = useState(false);

  useEffect(() => {
    if (!user || user.role !== "resident") { navigate("/login"); return; }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    const socket = io(getApiBaseUrl(), { auth: { token }, withCredentials: true, transports: ["websocket", "polling"] });
    socket.on("notification", () => setHasNewNotifications(true));
    socket.on("data_updated",  () => setHasNewBookings(true));
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/notifications") || notificationDrawerOpen) setHasNewNotifications(false);
    if (path.startsWith("/my-bookings") || path.startsWith("/booking")) setHasNewBookings(false);
    if (path.startsWith("/chat")) setUnreadMessages(0);
  }, [location.pathname, notificationDrawerOpen]);

  useEffect(() => { setMobileSidebarOpen(false); }, [location.pathname]);

  const handleOpenDrawer = (action) => {
    if (action === "notifications") setNotificationDrawerOpen(true);
    if (action === "calendar")      setCalendarDrawerOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 h-screen overflow-hidden border-r border-gray-100 shadow-sm">
        <ResidentSidebar user={user} hasNewNotifications={hasNewNotifications} hasNewBookings={hasNewBookings} unreadMessages={unreadMessages} onOpenDrawer={handleOpenDrawer} />
      </aside>

      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${mobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
        <aside className={`absolute left-0 top-0 bottom-0 w-72 flex flex-col h-full overflow-hidden shadow-2xl bg-white transform transition-transform duration-300 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <ResidentSidebar user={user} onClose={() => setMobileSidebarOpen(false)} hasNewNotifications={hasNewNotifications} hasNewBookings={hasNewBookings} unreadMessages={unreadMessages} onOpenDrawer={handleOpenDrawer} />
        </aside>
      </div>

      {/* Right: Navbar + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <ResidentNavbar onHamburgerClick={() => setMobileSidebarOpen(true)} user={user} hasNewNotifications={hasNewNotifications} hasNewBookings={hasNewBookings} unreadMessages={unreadMessages} onOpenDrawer={handleOpenDrawer} />
        <main className="flex-1 overflow-y-auto bg-gray-50 z-0">
          <div className="p-4 lg:p-6 xl:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      <NotificationDrawer isOpen={notificationDrawerOpen} onClose={() => setNotificationDrawerOpen(false)} />
      <CalendarDrawer     isOpen={calendarDrawerOpen}     onClose={() => setCalendarDrawerOpen(false)} />
    </div>
  );
}

