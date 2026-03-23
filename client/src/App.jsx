import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import { io } from "socket.io-client";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from './pages/LandingPage'
import ServiceProviders from "./pages/resident/ServiceProviders";
import HowItWorks from "./components/HowItWorks";
import PostJob from "./pages/resident/PostJob";
import MyBookings from "./pages/resident/MyBookings";
import BookingDetails from "./pages/resident/BookingDetails";
import SubmitReview from "./pages/resident/SubmitReview";
import ChatContainer from "./pages/chat/ChatContainer";
import MyCalendar from "./pages/MyCalendar"; 
import Notifications from "./pages/Notifications";


// Routes
import ServiceProviderRoutes from "./routes/serviceProviderRoutes";
import AdminRoutes from "./routes/adminRoutes";
import { useAuth } from "./context/AuthContext";
import UserProfile from "./pages/shared/UserProfile";
import Settings from "./pages/shared/Settings";
import HelpSupport from "./pages/shared/HelpSupport";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 20, cacheTime: 1000 * 60 * 30, refetchOnWindowFocus: true },
  },
});

/* ─────────────────────────────────────────
   ROUTE PROTECTORS
───────────────────────────────────────── */

// 1. LANDING PAGE ROUTE: Only Guests and Residents can view
const LandingPageRoute = () => {
  const { user } = useAuth();
  
  if (user) {
    if (user.role === "serviceprovider") return <Navigate to="/provider/dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  }
  // If no user (Guest) OR user is "resident", allow them to see the landing page
  return <Outlet />;
};

// 2. GUEST ROUTE: Strictly for Login & Signup (No logged-in users allowed)
const GuestRoute = () => {
  const { user } = useAuth();
  
  if (user) {
    if (user.role === "serviceprovider") return <Navigate to="/provider/dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    // If a resident tries to access /login or /signup, send them to the landing page
    return <Navigate to="/" replace />; 
  }
  return <Outlet />;
};

// 3. RESIDENT ROUTE: Only Residents can access these
const ResidentRoute = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "serviceprovider") return <Navigate to="/provider/dashboard" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  
  return <Outlet />;
};

// 4. SHARED ROUTE: Both Residents and Providers can access
const SharedRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

/* ─────────────────────────────────────────
   MAIN APP
───────────────────────────────────────── */
function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("accessToken") 
    if (!token || !user) return;

    const socket = io(import.meta.env.VITE_BASE_URL || "http://localhost:5000", {
      auth: { token },
      withCredentials: true,
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
  }, [user]);

  return (
    <>
      <Toaster />
      <Routes>
        
        {/* LANDING PAGE (Guest & Resident) */}
        <Route element={<LandingPageRoute />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* STRICT GUEST ROUTES (Login / Signup) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
           <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* GENERAL PUBLIC ROUTES (Anyone can view) */}
        <Route path="/how" element={<HowItWorks />} />
        <Route path="/serviceproviders" element={<ServiceProviders />} />

        {/* RESIDENT ONLY ROUTES */}
        <Route element={<ResidentRoute />}>
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
          <Route path="/review/:bookingId" element={<SubmitReview />} />
        
        </Route>

        {/* SHARED ROUTES (Chat & Calendar) */}
        <Route element={<SharedRoute />}>
          <Route path="/chat" element={<ChatContainer />} />
          <Route path="/chat/:bookingId" element={<ChatContainer />} />
          <Route path="/calendar" element={<MyCalendar />} />
          <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<HelpSupport />} />
        </Route>

      </Routes>
      
      {/* External Layouts handle their own protection */}
      <ServiceProviderRoutes />
      <AdminRoutes />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}