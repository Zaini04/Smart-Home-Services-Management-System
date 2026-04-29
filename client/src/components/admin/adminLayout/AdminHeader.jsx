import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";

const AdminHeader = ({ onMenuClick }) => {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    const titles = {
      dashboard: "Dashboard",
      analytics: "Analytics",
      "platform-earnings": "Platform Earnings",
      "platform-transactions": "Transactions",
      "create-category": "Categories",
      "create-subcategory": "Subcategories",
      "pending-workers": "Pending Workers",
      "update-kyc": "KYC Review",
      "settings": "Settings",
      "help": "Help & Support",
      "all-workers": "All Providers"
    };
    return titles[path] || "Dashboard";
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FaBars className="w-5 h-5 text-gray-600" />
          </button>

          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-sm font-bold text-gray-700 tracking-wide">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
