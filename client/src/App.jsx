import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import { io } from "socket.io-client";
import { getApiBaseUrl } from "./utils/url";

// ── Resident / Shared pages ──────────────────────────────────────────────────
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import HowItWorks from "./components/HowItWorks";
import PostJob from "./pages/resident/PostJob";
import MyBookings from "./pages/resident/MyBookings";
import BookingDetails from "./pages/resident/BookingDetails";
import SubmitReview from "./pages/resident/SubmitReview";
import ChatContainer from "./pages/chat/ChatContainer";
import MyCalendar from "./pages/MyCalendar";
import Notifications from "./pages/Notifications";
import UserProfile from "./pages/shared/UserProfile";
import Settings from "./pages/shared/Settings";
import HelpSupport from "./pages/shared/HelpSupport";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

// ── Admin pages ──────────────────────────────────────────────────────────────
import AdminHomePage from "./pages/admin/AdminHomePage";
import AdminDashboard from "./pages/admin/AdminDashbord";
import CreateCategory from "./pages/admin/CreateCategory";
import CreateSubCategory from "./pages/admin/CreateSubCategory";
import GetPendingWorkers from "./pages/admin/GetPendingWorkers";
import UpdateKyc from "./pages/admin/UpdateKyc";
import AllWorkers from "./pages/admin/AllWorkers";
import PlatformEarnings from "./pages/admin/PlatformEarnings";
import PlatformTransactions from "./pages/admin/PlatformTransactions";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/Settings";
import HelpSupportAdmin from "./pages/admin/HelpSupportAdmin";

// ── Service Provider pages ───────────────────────────────────────────────────
import ServiceProviderDashboard from "./pages/serviceProvider/ServiceProviderDashboard";
import AvailableJobs from "./pages/serviceProvider/AvailabeJobs";
import MyOffers from "./pages/serviceProvider/MyOffers";
import MyJobs from "./pages/serviceProvider/MyJobs";
import JobDetails from "./pages/serviceProvider/JobDetails";
import EditProfile from "./pages/serviceProvider/EditProfile";
import ProviderLayout from "./pages/serviceProvider/ProviderLayout";
import ResidentLayout from "./pages/resident/ResidentLayout";
import CompleteProfile from "./pages/serviceProvider/CompleteProfile";
import KYCStatus from "./pages/serviceProvider/KYCStatus";
import ProviderWallet from "./pages/serviceProvider/ProviderWallet";


import { useAuth } from "./context/AuthContext";

// ── React Query client ───────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 20, cacheTime: 1000 * 60 * 30, refetchOnWindowFocus: true },
  },
});

/* ═══════════════════════════════════════════
   ROUTE GUARDS
   Each guard reads user from AuthContext (single source of truth).
   No guard does a hard window.location — all redirects are React Router
   <Navigate> so the app never does a full page reload.
═══════════════════════════════════════════ */

// 1. Landing page — guests & residents only
const LandingPageRoute = () => {
  const { user } = useAuth();
  if (user?.role === "serviceprovider") return <Navigate to="/provider/dashboard" replace />;
  if (user?.role === "admin")           return <Navigate to="/admin/dashboard"    replace />;
  return <Outlet />;
};

// 2. Guest only — redirect logged-in users away from /login & /signup
const GuestRoute = () => {
  const { user } = useAuth();
  if (user?.role === "serviceprovider") return <Navigate to="/provider/dashboard" replace />;
  if (user?.role === "admin")           return <Navigate to="/admin/dashboard"    replace />;
  if (user)                             return <Navigate to="/"                   replace />;
  return <Outlet />;
};

// 3. Resident only
const ResidentRoute = () => {
  const { user } = useAuth();
  if (!user)                            return <Navigate to="/login"              replace />;
  if (user.role === "serviceprovider")  return <Navigate to="/provider/dashboard" replace />;
  if (user.role === "admin")            return <Navigate to="/admin/dashboard"    replace />;
  return <Outlet />;
};

// 4. Any authenticated user (resident OR provider)
const SharedRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// 5. Admin only
const AdminRoute = () => {
  const { user } = useAuth();
  if (!user)                  return <Navigate to="/login" replace />;
  if (user.role !== "admin")  return <Navigate to="/"     replace />;
  return <Outlet />;
};

// 6. Service provider only
const ProviderRoute = () => {
  const { user } = useAuth();
  if (!user || user.role !== "serviceprovider") return <Navigate to="/" replace />;
  return <Outlet />;
};

/* ═══════════════════════════════════════════
   MAIN APP CONTENT
═══════════════════════════════════════════ */
function AppContent() {
  const { user } = useAuth();
  const apiBaseUrl = getApiBaseUrl();

  // Global socket — only for toast notifications
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || !user) return;

    const socket = io(apiBaseUrl, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("notification", (data) => {
      queryClient.invalidateQueries(["notifications"]);
      toast.success(
        <div>
          <strong>{data.title}</strong>
          <p className="text-sm">{data.message}</p>
        </div>,
        { duration: 5000, position: "top-right" }
      );
    });

    return () => socket.disconnect();
  }, [user, apiBaseUrl]);

  return (
    <>
      <Toaster />

      {/* ── ONE single <Routes> tree — the fix for the routing loop ── */}
      <Routes>

        {/* Landing page */}
        <Route element={<LandingPageRoute />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Guest-only (login / signup / password reset) */}
        <Route element={<GuestRoute />}>
          <Route path="/login"                   element={<Login />} />
          <Route path="/signup"                  element={<Signup />} />
          <Route path="/forgot-password"         element={<ForgotPassword />} />
          <Route path="/reset-password/:token"   element={<ResetPassword />} />
        </Route>

        {/* Public — anyone */}
        <Route path="/how"              element={<HowItWorks />} />

        {/* Resident-only Layout */}
        <Route element={<ResidentRoute />}>
          <Route element={<ResidentLayout />}>
            <Route path="/post-job"              element={<PostJob />} />
            <Route path="/my-bookings"           element={<MyBookings />} />
            <Route path="/booking/:id"           element={<BookingDetails />} />
            <Route path="/review/:bookingId"     element={<SubmitReview />} />
            
            {/* Previously shared roots, now scoped cleanly into Resident Layout */}
            <Route path="/chat"                  element={<ChatContainer />} />
            <Route path="/chat/:bookingId"       element={<ChatContainer />} />
            <Route path="/calendar"              element={<MyCalendar />} />
            <Route path="/notifications"         element={<Notifications />} />
            <Route path="/profile"               element={<UserProfile />} />
            <Route path="/settings"              element={<Settings />} />
            <Route path="/support"               element={<HelpSupport />} />
          </Route>
        </Route>

        {/* ── ADMIN (was in adminRoutes.jsx) ── */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminHomePage />}>
            <Route index                                   element={<AdminDashboard />} />
            <Route path="dashboard"                        element={<AdminDashboard />} />
            <Route path="analytics"                        element={<AdminAnalytics />} />
            <Route path="all-workers"                      element={<AllWorkers />} />
            <Route path="create-category"                  element={<CreateCategory />} />
            <Route path="create-subcategory"               element={<CreateSubCategory />} />
            <Route path="pending-workers"                  element={<GetPendingWorkers />} />
            <Route path="update-kyc/:providerId"           element={<UpdateKyc />} />
            <Route path="platform-earnings"                element={<PlatformEarnings />} />
            <Route path="platform-transactions"            element={<PlatformTransactions />} />
            <Route path="settings"                         element={<AdminSettings />} />
            <Route path="help"                             element={<HelpSupportAdmin />} />
          </Route>
        </Route>

        {/* ── SERVICE PROVIDER (was in serviceProviderRoutes.jsx) ── */}
        <Route element={<ProviderRoute />}>
          <Route path="/provider" element={<ProviderLayout />}>
            <Route index                                   element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"                        element={<ServiceProviderDashboard />} />
            <Route path="kyc-status"                       element={<KYCStatus />} />
            <Route path="complete-profile"                 element={<CompleteProfile />} />
            <Route path="available-jobs"                   element={<AvailableJobs />} />
            <Route path="my-offers"                        element={<MyOffers />} />
            <Route path="my-jobs"                          element={<MyJobs />} />
            <Route path="job/:bookingId"                   element={<JobDetails />} />
            <Route path="wallet"                           element={<ProviderWallet />} />
            <Route path="profile"                          element={<UserProfile />} />
            <Route path="settings"                         element={<Settings />} />
            <Route path="support"                          element={<HelpSupport />} />
            <Route path="edit-profile"                     element={<EditProfile />} />
            <Route path="notifications"                    element={<Notifications />} />
            <Route path="chat"                             element={<ChatContainer />} />
            <Route path="chat/:bookingId"                  element={<ChatContainer />} />
            <Route path="calendar"                         element={<MyCalendar />} />
          </Route>
        </Route>

        {/* ── Catch-all 404 Route ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
      {/* ── end single Routes tree ── */}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}