import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from './pages/LandingPage'
import CompleteProfile from './pages/serviceProvider/CompleteProfile'
import ServiceProviderDashboard from './pages/serviceProvider/ServiceProviderDashboard'
import AllServices from './pages/resident/AllServices'
import Services from "./components/Services";
import ServiceProviders from "./pages/resident/ServiceProviders";
import HowItWorks from "./components/HowItWorks";
import AdminRoutes from "./routes/adminRoutes";
import KYCStatus from "./pages/serviceProvider/KYCStatus";
import EditProfile from "./pages/serviceProvider/EditProfile";
import PostJob from "./pages/resident/PostJob";
import MyBookings from "./pages/resident/MyBookings";
import BookingDetails from "./pages/resident/BookingDetails";
import SubmitReview from "./pages/resident/SubmitReview";
import AvailableJobs from "./pages/serviceProvider/AvailabeJobs";
import MyOffers from "./pages/serviceProvider/MyOffers";
import MyJobs from "./pages/serviceProvider/MyJobs";
import JobDetails from "./pages/serviceProvider/JobDetails";
import ServiceProviderRoutes from "./routes/serviceProviderRoutes";
import Chat from "./pages/chat/chat";
import ChatInbox from "./pages/chat/ChatInbox";
import ChatContainer from "./pages/chat/ChatContainer";
import { io } from "socket.io-client";

// Initialize React Query Client for caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20, // Keep data fresh without background refetch for 5 mins
      cacheTime: 1000 * 60 * 30, // Keep data in memory for 30 mins
      refetchOnWindowFocus: true, // Prevents refetching every time you switch browser tabs
    },
  },
});

function App() {

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(import.meta.env.VITE_BASE_URL || "http://localhost:5000", {
      auth: { token },
      withCredentials: true,
    });

    // 🌟 Global listener for instant popups!
    socket.on("notification", (data) => {
      toast.success(
        <div>
          <strong>{data.title}</strong>
          <p className="text-sm">{data.message}</p>
        </div>, 
        { duration: 5000, position: "top-right" }
      );
    });

    return () => socket.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster /> 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage  />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* <Route path="/complete-profile" element={<CompleteProfile/>}/> */}
          <Route path="/services" element={<Services/>}/>
          <Route path="/allservices" element={<AllServices />}/>
          <Route path="/how" element={<HowItWorks/>}/>
          {/* <Route path="/provider-dashboard" element={<ServiceProviderDashboard/>}/> */}
          <Route  path="/serviceproviders" element={<ServiceProviders/>}/>
          {/* <Route path="/kyc-status" element={<KYCStatus />} />
          <Route path="/edit-profile" element={<EditProfile />} /> */}
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
          <Route path="/review/:bookingId" element={<SubmitReview />} />
          {/* <Route path="/provider/available-jobs" element={<AvailableJobs />} />
          <Route path="/provider/my-offers" element={<MyOffers />} />
          <Route path="/provider/my-jobs" element={<MyJobs />} />
          <Route path="/provider/job/:bookingId" element={<JobDetails />} /> */}

         <Route path="/chat" element={<ChatContainer />} />
<Route path="/chat/:bookingId" element={<ChatContainer />} />

        </Routes>
        <ServiceProviderRoutes/>
        <AdminRoutes/>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;