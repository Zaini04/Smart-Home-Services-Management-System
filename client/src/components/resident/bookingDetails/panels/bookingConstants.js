// panels/bookingConstants.js
import {
  FaClock, FaBell, FaCheckCircle, FaSearch,
  FaMoneyBillWave, FaKey, FaTools, FaTimesCircle,
} from "react-icons/fa";

export const statusMeta = {
  posted:                   { label: "Waiting for Offers",   color: "bg-blue-100 text-blue-700",   step: 1, icon: FaClock,         message: "Your job is live! Workers are reviewing it and will send offers soon." },
  offers_received:          { label: "Offers Received",      color: "bg-purple-100 text-purple-700", step: 2, icon: FaBell,          message: "You have received offers! Review them below and accept the best one." },
  provider_selected:        { label: "Worker Selected",      color: "bg-emerald-100 text-emerald-700", step: 3, icon: FaCheckCircle, message: "Worker selected! They will either send a price or request an inspection." },
  inspection_requested:     { label: "Inspection Requested", color: "bg-yellow-100 text-yellow-700", step: 3, icon: FaSearch,        message: "Worker wants to inspect before giving a final price. Review the inspection fee." },
  inspection_approved:      { label: "Inspection Approved",  color: "bg-orange-100 text-orange-700", step: 3, icon: FaClock,         message: "Inspection approved! Worker will visit to assess the problem." },
  awaiting_price_approval:  { label: "Price Approval Needed", color: "bg-amber-100 text-amber-700", step: 4, icon: FaMoneyBillWave, message: "Worker has sent the final price and schedule. Review and approve to proceed." },
  price_approved:           { label: "Price Approved",       color: "bg-teal-100 text-teal-700",   step: 5, icon: FaKey,            message: "Share the Start OTP with the worker when they arrive to begin work." },
  work_in_progress:         { label: "Work In Progress",     color: "bg-indigo-100 text-indigo-700", step: 6, icon: FaTools,        message: "Worker is currently working. Once done, enter the Complete OTP to confirm payment." },
  completed:                { label: "Completed",            color: "bg-green-100 text-green-700", step: 7, icon: FaCheckCircle,    message: "Job completed successfully! Please leave a review for the worker." },
  cancelled:                { label: "Cancelled",            color: "bg-red-100 text-red-700",     step: 0, icon: FaTimesCircle,    message: "This booking has been cancelled." },
};

export const lifecycleSteps = [
  { step: 1, label: "Posted" },
  { step: 2, label: "Offers" },
  { step: 3, label: "Inspection" },
  { step: 4, label: "Pricing" },
  { step: 5, label: "Approved" },
  { step: 6, label: "Working" },
  { step: 7, label: "Done" },
];

export function formatSchedule(schedule) {
  if (!schedule?.scheduledStartDate) return null;
  const start = new Date(schedule.scheduledStartDate);
  const dur = schedule.estimatedDuration;
  return {
    dateStr: start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    timeStr: start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    durStr: dur ? `${dur.value} ${dur.unit}` : "",
    start,
  };
}

