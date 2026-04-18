// utils/scheduleCheck.js
import Booking from "../models/bookingModel.js";

/**
 * Calculate end date/time based on start and duration
 */
export const calculateEndDate = (startDate, duration) => {
  const ms = duration.unit === "hours"
    ? duration.value * 3600000
    : duration.value * 86400000;
  return new Date(new Date(startDate).getTime() + ms);
};

/**
 * Check if provider has any scheduled work/inspection at the proposed time
 * 
 * Logic for Pakistani market:
 * - Provider can arrive anytime within scheduled window
 * - Conflict = Can't reach next job because current job ends too late
 * - Rule: Job A end time > Job B window end time = CONFLICT
 */
export const checkScheduleConflict = async (
  providerId,
  startDate,
  duration,
  excludeBookingId = null
) => {
  const newStart = new Date(startDate);
  
  // Block past dates
  if (newStart < new Date()) {
    return {
      hasConflict: true,
      conflictWith: {
        message: "Cannot schedule in the past",
        isPast: true,
      },
    };
  }

  const newEnd = calculateEndDate(startDate, duration);
  const isNewMultiDay = duration.unit === "days";

  // ✅ Find ALL provider's scheduled activities (including pending ones and inspections)
  const query = {
    selectedProvider: providerId,
    status: { 
      $in: [
        "inspection_requested", 
        "inspection_approved",    
        "awaiting_price_approval",
        "price_approved", 
        "work_in_progress"
      ] 
    },
    $or: [
      { "schedule.scheduledStartDate": { $ne: null } },
      { "inspection.scheduledDate": { $ne: null } }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBookings = await Booking.find(query)
    .populate("resident", "full_name phone")
    .populate("category", "name");

  // Check each existing booking for conflict
  for (const ex of existingBookings) {
    // Extract start and end times properly considering if it's an inspection or a job
    const isInspectionOnly = ["inspection_requested", "inspection_approved"].includes(ex.status);
    
    let exStart;
    let exEnd;
    let exMultiDay = false;

    if (isInspectionOnly && ex.inspection?.scheduledDate) {
      exStart = new Date(ex.inspection.scheduledDate);
      // Inspections are assumed to be 1 hour
      exEnd = calculateEndDate(exStart, { value: 1, unit: "hours" });
    } else if (ex.schedule?.scheduledStartDate) {
      exStart = new Date(ex.schedule.scheduledStartDate);
      exEnd = ex.schedule.scheduledEndDate
        ? new Date(ex.schedule.scheduledEndDate)
        : calculateEndDate(exStart, ex.schedule.estimatedDuration);
      exMultiDay = ex.schedule.estimatedDuration?.unit === "days";
    } else {
      continue; // No valid date found, shouldn't happen due to query but safe fallback
    }
    
    // ✅ FIXED LOGIC: Maintain required buffer times between jobs
    if (!isNewMultiDay && !exMultiDay) {
      // Both hourly jobs/inspections: strict 2-hour gap required
      const gapMs = 2 * 3600000; // 2 hours in ms
      
      const hasConflict = 
        newStart < new Date(exEnd.getTime() + gapMs) && 
        newEnd > new Date(exStart.getTime() - gapMs);
      
      if (hasConflict) {
        return {
          hasConflict: true,
          conflictWith: {
            bookingId: ex.bookingId,
            _id: ex._id,
            residentName: ex.resident?.full_name || "Resident",
            residentPhone: ex.resident?.phone || "",
            residentId: ex.resident?._id,
            category: ex.category?.name || "Service",
            start: exStart,
            end: exEnd,
            message: ex.status === "inspection_approved"
              ? "You have an inspection scheduled within 2 hours of this time"
              : "You have another job scheduled within 2 hours of this time",
            isInspection: ex.status === "inspection_approved",
          },
        };
      }
    } else {
      // Multi-day jobs - strict 2-day gap required
      const gapMs = 2 * 86400000; // 2 days
      
      const hasOverlap = 
        newStart < new Date(exEnd.getTime() + gapMs) &&
        newEnd > new Date(exStart.getTime() - gapMs);

      if (hasOverlap) {
        return {
          hasConflict: true,
          conflictWith: {
            bookingId: ex.bookingId,
            _id: ex._id,
            residentName: ex.resident?.full_name || "Resident",
            residentPhone: ex.resident?.phone || "",
            residentId: ex.resident?._id,
            category: ex.category?.name || "Service",
            start: exStart,
            end: exEnd,
            message: "Multi-day jobs need a 2-day gap between them",
            isInspection: false,
          },
        };
      }
    }
  }

  return { hasConflict: false };
};