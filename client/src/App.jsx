import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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


function App() {
  return (
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
        <Route path="/submit-review" element={<SubmitReview />} />
        {/* <Route path="/provider/available-jobs" element={<AvailableJobs />} />
        <Route path="/provider/my-offers" element={<MyOffers />} />
        <Route path="/provider/my-jobs" element={<MyJobs />} />
        <Route path="/provider/job/:bookingId" element={<JobDetails />} /> */}

      </Routes>
      <ServiceProviderRoutes/>
      <AdminRoutes/>
    </BrowserRouter>
  );
}

export default App;
