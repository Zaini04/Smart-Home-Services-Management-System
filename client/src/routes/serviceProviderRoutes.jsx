// App.jsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import ServiceProviderDashboard from "../pages/serviceProvider/ServiceProviderDashboard";
import AvailableJobs from "../pages/serviceProvider/AvailabeJobs";
import MyOffers from "../pages/serviceProvider/MyOffers";   
import MyJobs from "../pages/serviceProvider/MyJobs";
import JobDetails from "../pages/serviceProvider/JobDetails";
import ProviderEarnings from "../pages/serviceProvider/Earnings";
import EditProfile from "../pages/serviceProvider/EditProfile";
import ProviderLayout from "../pages/serviceProvider/ProviderLayout";
import CompleteProfile from "../pages/serviceProvider/CompleteProfile";
import KYCStatus from "../pages/serviceProvider/KYCStatus";
import ProviderWallet from "../pages/serviceProvider/ProviderWallet";
import ChatContainer from "../pages/chat/ChatContainer";
import MyCalendar from "../pages/MyCalendar";
import { useAuth } from "../context/AuthContext";
import Notifications from "../pages/Notifications";
import UserProfile from "../pages/shared/UserProfile";
import Settings from "../pages/shared/Settings";
import HelpSupport from "../pages/shared/HelpSupport";

const ProviderRoute = () => {
  const { user } = useAuth();
  
  if (!user || user.role !== "serviceprovider") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default function ServiceProviderRoutes() {
  return (
    <Routes>
      {/* Wrap everything in the ProviderRoute */}
      <Route element={<ProviderRoute />}>
        <Route path="/provider" element={<ProviderLayout />}>
          <Route path="kyc-status" element={<KYCStatus />} />
          <Route path="complete-profile" element={<CompleteProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ServiceProviderDashboard />} />
          <Route path="available-jobs" element={<AvailableJobs />} />
          <Route path="my-offers" element={<MyOffers />} />
          <Route path="my-jobs" element={<MyJobs />} />
          <Route path="job/:bookingId" element={<JobDetails />} />
          <Route path="earnings" element={<ProviderEarnings />} />
          <Route path="wallet" element={<ProviderWallet />} />
               <Route path="profile" element={<UserProfile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="support" element={<HelpSupport />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="notifications" element={<Notifications />} />

          
          <Route path="chat" element={<ChatContainer />} />
          <Route path="chat/:bookingId" element={<ChatContainer />} />
          <Route path="calendar" element={<MyCalendar />} />
        </Route>
      </Route>
    </Routes>
  );
}