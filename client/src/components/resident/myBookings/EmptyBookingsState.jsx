// myBookings/EmptyBookingsState.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaClipboardList, FaArrowRight } from "react-icons/fa";

function EmptyBookingsState() {
  return (
    <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaClipboardList className="w-10 h-10 text-gray-300" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h3>
      <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
        You haven't posted any tasks matching this filter. Start by booking a new service request!
      </p>
      <Link
        to="/post-job"
        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 text-gray-900 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
      >
        Book a Service <FaArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  );
}

export default EmptyBookingsState;

