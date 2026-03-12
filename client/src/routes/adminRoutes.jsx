import { Routes, Route } from "react-router-dom";
import AdminProtectedRoute from "../pages/admin/AdminProtectedRoute";
import AdminHomePage from "../pages/admin/AdminHomePage";
import AdminDashboard from "../pages/admin/AdminDashbord";
import AddService from "../pages/admin/AddService";
import CreateCategory from "../pages/admin/CreateCategory";
import CreateSubCategory from "../pages/admin/createSubCategory";
import GetPendingWorkers from "../pages/admin/GetPendingWorkers";
import UpdateKyc from "../pages/admin/UpdateKyc";
import AllServices from "../pages/admin/AllSrervices";
import AllWorkers from "../pages/admin/AllWorkers";
import PlatformEarnings from "../pages/admin/PlatformEarnings";
import PlatformTransactions from "../pages/admin/PlatformTransactions";


export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminHomePage />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="add-service" element={<AddService />} />
        <Route path="all-services" element={<AllServices />} />
        <Route path="all-workers" element={<AllWorkers />} />
        <Route path="create-category" element={<CreateCategory />} />
        <Route path="create-subcategory" element={<CreateSubCategory />} />
        <Route path="pending-workers" element={<GetPendingWorkers />} />
        <Route path="update-kyc/:providerId" element={<UpdateKyc />} />
        <Route path="platform-earnings" element={<PlatformEarnings />} />          {/* ← NEW */}
        <Route path="platform-transactions" element={<PlatformTransactions />} />  {/* ← NEW */}
      </Route>
    </Routes>
  );
}


