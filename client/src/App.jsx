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


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage  />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/complete-profile" element={<CompleteProfile/>}/>
        <Route path="/services" element={<Services/>}/>
        <Route path="/allservices" element={<AllServices />}/>
        <Route path="/how" element={<HowItWorks/>}/>
        <Route path="/provider-dashboard" element={<ServiceProviderDashboard/>}/>
        <Route  path="/serviceproviders" element={<ServiceProviders/>}/>
        <Route path="/kyc-status" element={<KYCStatus />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
      <AdminRoutes/>
    </BrowserRouter>
  );
}

export default App;
