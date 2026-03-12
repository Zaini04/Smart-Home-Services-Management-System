// utils/scheduleCheck.js
import Booking from "../models/bookingModel.js";

export const calculateEndDate = (startDate, duration) => {
  const ms = duration.unit === "hours"
    ? duration.value * 3600000
    : duration.value * 86400000;
  return new Date(new Date(startDate).getTime() + ms);
};

/**
 * Returns { hasConflict, conflictWith } or { hasConflict: false }
 *
 * Gap rules:
 *  - Either job is measured in DAYS  →  2-day gap
 *  - Both are in HOURS              →  2-hour gap
 */
export const checkScheduleConflict = async (
  providerId,
  startDate,
  duration,
  excludeBookingId = null
) => {
  const newStart      = new Date(startDate);
   if (newStart < new Date()) {
    return {
      hasConflict: true,
      conflictWith: {
        bookingId: null,
        start: null,
        end: null,
        requiredGap: "Cannot schedule in the past",
      },
    };
  }
  const newEnd        = calculateEndDate(startDate, duration);
  const isNewMultiDay = duration.unit === "days";

  const query = {
    selectedProvider: providerId,
    status: { $in: ["price_approved", "work_in_progress"] },
    "schedule.scheduledStartDate": { $ne: null },
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const existing = await Booking.find(query);

  for (const ex of existing) {
    const exStart = new Date(ex.schedule.scheduledStartDate);
    const exEnd   = ex.schedule.scheduledEndDate
      ? new Date(ex.schedule.scheduledEndDate)
      : calculateEndDate(exStart, ex.schedule.estimatedDuration);

    const exMultiDay = ex.schedule.estimatedDuration?.unit === "days";
    const gapMs      = (isNewMultiDay || exMultiDay) ? 2 * 86400000 : 2 * 3600000;

    // overlap check with buffer on both sides
    if (newStart < new Date(exEnd.getTime() + gapMs) &&
        newEnd   > new Date(exStart.getTime() - gapMs)) {
      return {
        hasConflict: true,
        conflictWith: {
          bookingId:   ex.bookingId,
          start:       exStart,
          end:         exEnd,
          requiredGap: (isNewMultiDay || exMultiDay) ? "2 days" : "2 hours",
        },
      };
    }
  }

  return { hasConflict: false };
};