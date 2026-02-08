import Offer from "../../models/bidingOfferModel.js";
import Booking from "../../models/bookingModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";


/* ---------------- CREATE BOOKING ---------------- */
export const createBooking = async (req, res) => {
  try {
    const { category, description, address } = req.body;

    if (!category || !description || !address) {
      return errorResponse(res, "All fields are required", 400);
    }

    const booking = await Booking.create({
      resident: req.user._id,
      category,
      description,
      address,
      images: req.files?.map((f) => f.path) || [],
      status: "posted",
    });

    return successResponse(res, "Booking posted successfully", booking, 201);
  } catch (err) {
    return errorResponse(res, "Failed to create booking", 500, err.message);
  }
};

/* ---------------- VIEW MY BOOKINGS ---------------- */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ resident: req.user._id })
      .populate("category", "name")
      .populate("selectedProvider", "rating status")
      .sort({ createdAt: -1 });

    return successResponse(res, "My bookings", bookings, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch bookings", 500, err.message);
  }
};

/* ---------------- VIEW OFFERS FOR A BOOKING ---------------- */
export const getBookingOffers = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const offers = await Offer.find({ booking: bookingId })
      .populate("provider", "rating experience")
      .sort({ createdAt: 1 });

    return successResponse(res, "Offers fetched", offers, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch offers", 500, err.message);
  }
};

/* ---------------- ACCEPT OFFER ---------------- */
export const acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) return errorResponse(res, "Offer not found", 404);

    const booking = await Booking.findById(offer.booking);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.resident.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Unauthorized", 403);
    }

    offer.status = "accepted";
    await offer.save();

    await Offer.updateMany(
      { booking: booking._id, _id: { $ne: offer._id } },
      { status: "rejected" }
    );

    booking.selectedProvider = offer.provider;
    booking.inspection.required = offer.inspectionRequired;
    booking.inspection.fee = offer.proposedInspectionFee;
    booking.status = offer.inspectionRequired
      ? "inspection_pending"
      : "scheduled";

    await booking.save();

    return successResponse(res, "Offer accepted", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to accept offer", 500, err.message);
  }
};

/* ---------------- APPROVE INSPECTION ---------------- */
export const approveInspection = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    booking.inspection.approvedByResident = true;
    booking.status = "inspection_scheduled";

    await booking.save();

    return successResponse(res, "Inspection approved", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to approve inspection", 500, err.message);
  }
};

/* ---------------- CANCEL BOOKING ---------------- */
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    booking.status = "cancelled";
    booking.cancelledBy = "resident";
    booking.cancellationReason = reason || "";

    await booking.save();

    return successResponse(res, "Booking cancelled", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to cancel booking", 500, err.message);
  }
};
