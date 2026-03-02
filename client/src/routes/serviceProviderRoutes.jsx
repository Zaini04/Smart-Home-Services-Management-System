// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ServiceProviderDashboard from "../pages/serviceProvider/ServiceProviderDashboard";
import AvailableJobs from "../pages/serviceProvider/AvailabeJobs";
import MyOffers from "../pages/serviceProvider/MyOffers";   
import MyJobs from "../pages/serviceProvider/MyJobs";
import JobDetails from "../pages/serviceProvider/JobDetails";
import ProviderEarnings from "../pages/serviceProvider/Earnings";
// import ProviderProfile from "../pages/serviceProvider/ProviderProfile";
import EditProfile from "../pages/serviceProvider/EditProfile";
import ProviderLayout from "../pages/serviceProvider/ProviderLayout";
import CompleteProfile from "../pages/serviceProvider/CompleteProfile";
import KYCStatus from "../pages/serviceProvider/KYCStatus";
import Chat from "../pages/chat/chat";
import ChatInbox from "../pages/chat/ChatInbox";


export default function ServiceProviderRoutes() {
  return (
<Routes>

  {/* Provider routes — all share the layout */}
  <Route path="/provider" element={<ProviderLayout />}>
    {/* /provider → redirect to dashboard */}
    <Route path="kyc-status" element={<KYCStatus />} />
    <Route path="complete-profile" element={<CompleteProfile/>}/>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard"      element={<ServiceProviderDashboard />} />
    <Route path="available-jobs" element={<AvailableJobs />} />
    <Route path="my-offers"      element={<MyOffers />} />
    <Route path="my-jobs"        element={<MyJobs />} />
    <Route path="job/:bookingId" element={<JobDetails />} />
    <Route path="earnings"       element={<ProviderEarnings />} />
    {/* <Route path="profile"        element={<ProviderProfile />} /> */}
    <Route path="edit-profile"   element={<EditProfile />} />
  </Route>
      <Route path="/provider/messages" element={<ChatInbox />} />
      <Route path="/provider/chat/:bookingId" element={<Chat />} />

</Routes>
  )}
