import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/adminLayout/AdminSidebar";
import AdminHeader from "../../components/admin/adminLayout/AdminHeader";

/* ------------------ SIDEBAR COMPONENT ------------------ */

export default function AdminHomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/50 py-4 px-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} HomeFix Admin. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}