import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaHome,
  FaClipboardList,
  FaCalendarAlt,
  FaWallet,
  FaStar,
  FaCog,
  FaUser,
  FaBell,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaPhone,
  FaMapMarkerAlt,
  FaTools,
  FaMoneyBillWave,
  FaUserCheck,
  FaExclamationCircle,
} from "react-icons/fa";

/* ------------------ SIDEBAR COMPONENT ------------------ */

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "overview", icon: FaHome, label: "Overview" },
    { id: "bookings", icon: FaClipboardList, label: "Bookings" },
    { id: "schedule", icon: FaCalendarAlt, label: "Schedule" },
    { id: "earnings", icon: FaWallet, label: "Earnings" },
    { id: "reviews", icon: FaStar, label: "Reviews" },
    { id: "profile", icon: FaUser, label: "Profile" },
    { id: "settings", icon: FaCog, label: "Settings" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Provider Dashboard</h2>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${activeTab === item.id
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                : "text-gray-600 hover:bg-gray-50"
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Help Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
            <FaExclamationCircle className="w-5 h-5 text-white" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-1">Need Help?</h4>
          <p className="text-sm text-gray-600 mb-3">
            Contact our support team for assistance.
          </p>
          <button className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Get Support
          </button>
        </div>
      </div>
    </aside>
  );
};

/* ------------------ STAT CARD COMPONENT ------------------ */

const StatCard = ({ icon: Icon, label, value, change, changeType, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${
        changeType === "up" ? "text-green-600" : "text-red-600"
      }`}>
        {changeType === "up" ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
        {change}%
      </div>
    </div>
    <div className="mt-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

/* ------------------ BOOKING CARD COMPONENT ------------------ */

const BookingCard = ({ booking }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
            {booking.customer.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{booking.customer}</h4>
            <p className="text-sm text-gray-500">{booking.service}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[booking.status]}`}>
          {booking.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaCalendarAlt className="w-4 h-4 text-gray-400" />
          {booking.date} at {booking.time}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
          {booking.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaMoneyBillWave className="w-4 h-4 text-gray-400" />
          PKR {booking.amount.toLocaleString()}
        </div>
      </div>

      <div className="flex gap-2">
        {booking.status === "pending" && (
          <>
            <button className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              <FaCheckCircle className="w-4 h-4" />
              Accept
            </button>
            <button className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              <FaTimesCircle className="w-4 h-4" />
              Decline
            </button>
          </>
        )}
        {booking.status === "confirmed" && (
          <>
            <button className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <FaPhone className="w-4 h-4" />
              Contact
            </button>
            <button className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              <FaEye className="w-4 h-4" />
              Details
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function ServiceProviderDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data
  const stats = [
    { icon: FaClipboardList, label: "Total Bookings", value: "156", change: 12, changeType: "up", color: "bg-blue-600" },
    { icon: FaMoneyBillWave, label: "Total Earnings", value: "PKR 125,400", change: 8, changeType: "up", color: "bg-green-600" },
    { icon: FaStar, label: "Average Rating", value: "4.8", change: 3, changeType: "up", color: "bg-yellow-500" },
    { icon: FaUserCheck, label: "Completed Jobs", value: "142", change: 5, changeType: "up", color: "bg-purple-600" },
  ];

  const recentBookings = [
    { id: 1, customer: "Ahmed Khan", service: "AC Repair", date: "Today", time: "2:00 PM", location: "Gulberg, Lahore", amount: 3500, status: "pending" },
    { id: 2, customer: "Sara Ali", service: "Wiring Fix", date: "Tomorrow", time: "10:00 AM", location: "DHA Phase 5", amount: 1200, status: "confirmed" },
    { id: 3, customer: "Usman Malik", service: "Fan Installation", date: "Dec 25", time: "3:30 PM", location: "Model Town", amount: 800, status: "completed" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Welcome back, <span className="text-blue-600">Ahmed!</span>
              </h1>
              <p className="text-gray-500 mt-1">Here's what's happening with your services today.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <FaBell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <Link
                to="/complete-profile"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Bookings */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
                  <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Profile Completion</h3>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600">75% Complete</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCheckCircle className="w-4 h-4 text-green-500" />
                    Basic information added
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCheckCircle className="w-4 h-4 text-green-500" />
                    CNIC verified
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <FaClock className="w-4 h-4" />
                    Add portfolio images
                  </li>
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3">
                    <FaTools className="w-4 h-4 text-gray-500" />
                    Update Services
                  </button>
                  <button className="w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3">
                    <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                    Set Availability
                  </button>
                  <button className="w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3">
                    <FaChartLine className="w-4 h-4 text-gray-500" />
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}