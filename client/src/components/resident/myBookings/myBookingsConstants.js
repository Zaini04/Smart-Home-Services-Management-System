// myBookings/myBookingsConstants.js
import {
  FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, FaUser, FaClipboardList,
} from "react-icons/fa";

export const statusConfig = {
  posted:                  { color: "bg-blue-50 text-blue-700 border-blue-200",     label: "Waiting for Offers",    icon: FaClock },
  offers_received:         { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Offers Received",     icon: FaClipboardList },
  provider_selected:       { color: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Provider Selected",   icon: FaUser },
  inspection_pending:      { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Inspection Pending",  icon: FaClock },
  inspection_scheduled:    { color: "bg-orange-50 text-orange-700 border-orange-200", label: "Inspection Scheduled", icon: FaClock },
  inspection_done:         { color: "bg-cyan-50 text-cyan-700 border-cyan-200",       label: "Inspection Done",     icon: FaCheckCircle },
  awaiting_final_approval: { color: "bg-amber-50 text-amber-700 border-amber-200",    label: "Price Sent",          icon: FaClock },
  scheduled:               { color: "bg-teal-50 text-teal-700 border-teal-200",       label: "Scheduled",           icon: FaCheckCircle },
  work_in_progress:        { color: "bg-purple-50 text-purple-700 border-purple-200", label: "In Progress",         icon: FaSpinner },
  completed:               { color: "bg-green-50 text-green-700 border-green-200",    label: "Completed",           icon: FaCheckCircle },
  cancelled:               { color: "bg-red-50 text-red-700 border-red-200",          label: "Cancelled",           icon: FaTimesCircle },
};

export const filterOptions = [
  { key: "all",       label: "All Bookings" },
  { key: "active",    label: "Active Jobs" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

