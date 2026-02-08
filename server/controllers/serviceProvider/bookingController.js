import Booking from "../../models/bookingModel.js";
import Wallet from "../../models/walletModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";


/* ---------------- VIEW AVAILABLE BOOKINGS ---------------- */
export const getAvailableBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: "posted",
    })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return successResponse(res, "Available bookings", bookings, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch bookings", 500, err.message);
  }
};

/* ---------------- SEND / UPDATE OFFER ---------------- */
export const sendOrUpdateOffer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      laborEstimate,
      message,
      inspectionRequired,
      proposedInspectionFee,
    } = req.body;

    const wallet = await Wallet.findOne({ provider: req.user._id });
    if (!wallet || wallet.balance < 100) {
      return errorResponse(res, "Insufficient wallet balance", 400);
    }

    const offer = await Offer.findOneAndUpdate(
      { booking: bookingId, provider: req.user._id },
      {
        laborEstimate,
        message,
        inspectionRequired,
        proposedInspectionFee,
        status: "pending",
      },
      { upsert: true, new: true }
    );

    return successResponse(res, "Offer submitted", offer, 200);
  } catch (err) {
    return errorResponse(res, "Failed to submit offer", 500, err.message);
  }
};

/* ---------------- MARK INSPECTION DONE ---------------- */
export const completeInspection = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { finalLaborCost, materialCostNote } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    booking.finalLaborCost = finalLaborCost;
    booking.materialCostNote = materialCostNote;
    booking.inspection.completedByProvider = true;
    booking.status = "awaiting_final_approval";

    await booking.save();

    return successResponse(res, "Inspection completed", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to complete inspection", 500, err.message);
  }
};

/* ---------------- START WORK ---------------- */
export const startWork = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    booking.status = "work_in_progress";
    await booking.save();

    return successResponse(res, "Work started", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to start work", 500, err.message);
  }
};

/* ---------------- COMPLETE WORK ---------------- */
export const completeWork = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    booking.status = "completed";

    await booking.save();

    return successResponse(res, "Work completed", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to complete work", 500, err.message);
  }
};
