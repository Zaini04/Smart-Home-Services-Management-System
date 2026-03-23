import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaSpinner, FaCalendarAlt, FaSearch, FaWrench } from "react-icons/fa";
import { getMyJobs } from "../api/serviceProviderEndPoints";
import { getMyBookings } from "../api/residentsEndpoints";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const localizer = momentLocalizer(moment);

export default function MyCalendar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isProvider = user?.role === "serviceprovider";

  // Filters
  const [activeFilter, setActiveFilter] = useState("all");

  // 🌟 FIX: Add explicit State to Control the Calendar Buttons
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: isProvider ? ["myJobs"] : ["myBookings"],
    queryFn: async () => {
      const res = isProvider ? await getMyJobs() : await getMyBookings();
      return (res.data.data || []).filter(
        (b) => b.status !== "completed" && b.status !== "cancelled"
      );
    },
    enabled: !!user,
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

        if (activeFilter === "all" || activeFilter === "inspection") {
          calendarEvents.push({
            id: `${booking._id}-insp`,
            title: `🔍 Inspect: ${booking.category?.name || "Job"}`,
            start, end,
            resource: booking,
            type: "inspection",
          });
        }
      }

      // 2. Work Schedule
      if (booking.schedule?.scheduledStartDate && booking.schedule?.approvedByResident) {
        const start = new Date(booking.schedule.scheduledStartDate);
        let end = new Date(start);
        const durVal = booking.schedule.estimatedDuration?.value || 1;
        const durUnit = booking.schedule.estimatedDuration?.unit || "hours";

        if (durUnit === "hours") end = new Date(start.getTime() + durVal * 60 * 60 * 1000);
        else if (durUnit === "days") end = new Date(start.getTime() + durVal * 24 * 60 * 60 * 1000);

        if (activeFilter === "all" || activeFilter === "work") {
          calendarEvents.push({
            id: `${booking._id}-work`,
            title: `🛠️ Work: ${booking.category?.name || "Job"}`,
            start, end,
            resource: booking,
            type: "work",
          });
        }
      }
    });

    return calendarEvents;
  }, [bookings, activeFilter]);

  const handleEventClick = (event) => {
    const bookingId = event.resource._id;
    navigate(isProvider ? `/provider/job/${bookingId}` : `/booking/${bookingId}`);
  };

  const eventStyleGetter = (event) => {
    const isInspection = event.type === "inspection";
    return {
      style: {
        backgroundColor: isInspection ? "#f59e0b" : "#3b82f6", 
        borderRadius: "6px",
        opacity: 0.9,
        color: "white",
        border: "none",
        padding: "4px 8px",
        fontSize: "13px",
        fontWeight: "600",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
    };
  };

  if (!user) return null;

  return (
    <>

    {user.role === 'resident'? <Navbar /> : null}  
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaCalendarAlt className="text-white w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">My Schedule</h1>
                <p className="text-gray-600">Track your upcoming visits and work</p>
              </div>
            </div>

            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 flex gap-1">
              <button onClick={() => setActiveFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeFilter === "all" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"}`}>All</button>
              <button onClick={() => setActiveFilter("inspection")} className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeFilter === "inspection" ? "bg-amber-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}><FaSearch /> Inspections</button>
              <button onClick={() => setActiveFilter("work")} className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeFilter === "work" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}><FaWrench /> Work</button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 h-[75vh]">
            {isLoading ? (
              <div className="flex h-full flex-col items-center justify-center">
                <FaSpinner className="animate-spin text-blue-500 w-12 h-12 mb-4" />
                <p className="text-gray-500 font-medium">Loading your schedule...</p>
              </div>
            ) : (
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', fontFamily: "Inter, sans-serif" }}
                onSelectEvent={handleEventClick}
                eventPropGetter={eventStyleGetter}
                
                // 🌟 FIX: These 4 lines control the calendar so the buttons work perfectly
                view={currentView}
                onView={(newView) => setCurrentView(newView)}
                date={currentDate}
                onNavigate={(newDate) => setCurrentDate(newDate)}
                
                views={['month', 'week', 'day', 'agenda']}
              />
            )}
          </div>

        </div>
      </div>
      {user.role === 'resident'? <Footer /> : null}
    </>
  );
}