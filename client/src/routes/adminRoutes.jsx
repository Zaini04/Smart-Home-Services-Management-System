import { Routes, Route } from "react-router-dom";
import AdminProtectedRoute from "../pages/admin/AdminProtectedRoute";
import AdminHomePage from "../pages/admin/AdminHomePage";
import AdminDashboard from "../pages/admin/AdminDashbord";
import AddService from "../pages/admin/AddService";
import CreateCategory from "../pages/admin/CreateCategory";
import CreateSubCategory from "../pages/admin/createSubCategory";
import GetPendingWorkers from "../pages/admin/GetPendingWorkers";
import UpdateKyc from "../pages/admin/UpdateKyc";


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
        <Route path="create-category" element={<CreateCategory />} />
        <Route path="create-subcategory" element={<CreateSubCategory />} />
        <Route path="pending-workers" element={<GetPendingWorkers />} />
        <Route path="update-kyc/:providerId" element={<UpdateKyc />} />
      </Route>
    </Routes>
  );
}


