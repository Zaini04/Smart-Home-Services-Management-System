// jobDetails/panels/jobConstants.js
export const steps = [
  { step: 1, label: "Assigned" },
  { step: 2, label: "Inspection" },
  { step: 3, label: "Pricing" },
  { step: 4, label: "OTP" },
  { step: 5, label: "Working" },
  { step: 6, label: "Done" },
];

export const statusMeta = {
  provider_selected: { step: 1, label: "Assigned", color: "bg-emerald-100 text-emerald-700", message: "You've been selected! Send a price or request an inspection." },
  inspection_requested: { step: 1, label: "Inspection Requested", color: "bg-yellow-100 text-yellow-700", message: "Inspection request sent. Waiting for resident to approve." },
  inspection_approved: { step: 2, label: "Inspection Approved", color: "bg-orange-100 text-orange-700", message: "Inspection approved! Go inspect, then send the final price." },
  awaiting_price_approval: { step: 3, label: "Awaiting Price Approval", color: "bg-amber-100 text-amber-700", message: "Final price sent. Waiting for resident to approve." },
  price_approved: { step: 4, label: "Price Approved", color: "bg-teal-100 text-teal-700", message: "Price approved by resident! Verify start OTP to begin work." },
  work_in_progress: { step: 5, label: "Work In Progress", color: "bg-indigo-100 text-indigo-700", message: "Complete the work, then ask resident to confirm payment with complete OTP." },
  completed: { step: 6, label: "Completed", color: "bg-green-100 text-green-700", message: "Job completed! Payment received." },
  cancelled: { step: 0, label: "Cancelled", color: "bg-red-100 text-red-700", message: "This booking was cancelled." },
};

export function formatSchedule(schedule) {
  if (!schedule?.scheduledStartDate) return null;
  const start = new Date(schedule.scheduledStartDate);
  const dur = schedule.estimatedDuration;
  return {
    dateStr: start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    timeStr: start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    durStr: dur ? `${dur.value} ${dur.unit}` : "",
  };
}

