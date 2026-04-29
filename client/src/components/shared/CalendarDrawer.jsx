import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaSpinner, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { getMyJobs } from "../../api/serviceProviderEndPoints";
import { getMyBookings } from "../../api/residentsEndpoints";
import { useAuth } from "../../context/AuthContext";

const localizer = momentLocalizer(moment);

export default function CalendarDrawer({ isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isProvider = user?.role === "serviceprovider";

  const [currentDate, setCurrentDate] = useState(new Date());
  // Mobile/Drawer view works best heavily in 'agenda' or 'day' view
  const [currentView, setCurrentView] = useState("agenda"); 

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: isProvider ? ["myJobs"] : ["myBookings"],
    queryFn: async () => {
      const res = isProvider ? await getMyJobs() : await getMyBookings();
      return (res.data.data || []).filter(
        (b) => b.status !== "completed" && b.status !== "cancelled"
      );
    },
    enabled: isOpen && !!user, // Only fetch when open
  });

  const events = useMemo(() => {
    const calendarEvents = [];
    bookings.forEach((booking) => {
      // 1. Inspections
      if (booking.inspection?.scheduledDate && !booking.inspection.completedByProvider) {
        const dateStr = new Date(booking.inspection.scheduledDate).toISOString().split("T")[0];
        const timeStr = booking.inspection.scheduledTime || "09:00";
        const start = new Date(`${dateStr}T${timeStr}`);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour

        calendarEvents.push({
          id: `${booking._id}-insp`,
          title: `🔍 Inspect: ${booking.category?.name || "Job"}`,
          start, end,
          resource: booking,
          type: "inspection",
        });
      }

      // 2. Work Schedule
      if (booking.schedule?.scheduledStartDate && booking.schedule?.approvedByResident) {
        const start = new Date(booking.schedule.scheduledStartDate);
        let end = new Date(start);
        const durVal = booking.schedule.estimatedDuration?.value || 1;
        const durUnit = booking.schedule.estimatedDuration?.unit || "hours";

        if (durUnit === "hours") end = new Date(start.getTime() + durVal * 60 * 60 * 1000);
        else if (durUnit === "days") end = new Date(start.getTime() + durVal * 24 * 60 * 60 * 1000);

        calendarEvents.push({
          id: `${booking._id}-work`,
          title: `🛠️ Work: ${booking.category?.name || "Job"}`,
          start, end,
          resource: booking,
          type: "work",
        });
      }
    });

    return calendarEvents;
  }, [bookings]);

  const handleEventClick = (event) => {
    const bookingId = event.resource._id;
    onClose();
    navigate(isProvider ? `/provider/job/${bookingId}` : `/booking/${bookingId}`);
  };

  const eventStyleGetter = (event) => {
    const isInspection = event.type === "inspection";
    return {
      style: {
        backgroundColor: isInspection ? "#f59e0b" : "#3b82f6", 
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        padding: "2px 5px",
        fontSize: "12px",
        fontWeight: "600",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      },
    };
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Sliding Drawer */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-[101] flex flex-col border-l border-gray-100"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FaCalendarAlt className="text-indigo-600 w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">My Calendar</h2>
                  <p className="text-xs text-gray-500">Upcoming tasks and inspections</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <FaSpinner className="animate-spin text-indigo-500 w-8 h-8" />
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-full min-h-[500px]">
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%', fontFamily: "Inter, sans-serif" }}
                    onSelectEvent={handleEventClick}
                    eventPropGetter={eventStyleGetter}
                    
                    view={currentView}
                    onView={(newView) => setCurrentView(newView)}
                    date={currentDate}
                    onNavigate={(newDate) => setCurrentDate(newDate)}
                    
                    views={['month', 'week', 'day', 'agenda']}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

