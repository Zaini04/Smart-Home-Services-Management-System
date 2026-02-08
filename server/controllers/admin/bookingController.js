import Booking from "../../models/bookingModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

/* ---------------- VIEW ALL BOOKINGS ---------------- */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("resident", "full_name email")
      .populate("selectedProvider")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return successResponse(res, "All bookings", bookings, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch bookings", 500, err.message);
  }
};

/* ---------------- VIEW SINGLE BOOKING ---------------- */
export const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("resident")
      .populate("selectedProvider")
      .populate("category");

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    return successResponse(res, "Booking details", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch booking", 500, err.message);
  }
};
