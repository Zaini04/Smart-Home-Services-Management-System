// controllers/resident/bookingController.js
import Offer from "../../models/bidingOfferModel.js";
import Booking from "../../models/bookingModel.js";
import Review from "../../models/reviewModel.js";
import ServiceProvider from "../../models/service_providerModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

// Commission rate (15% on labor only)
const COMMISSION_RATE = 0.15;

// Generate OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

/* ---------------- CREATE BOOKING ---------------- */
export const createBooking = async (req, res) => {
  try {
    const { category, description, address } = req.body;

    if (!category || !description || !address) {
      return errorResponse(res, "All fields are required", 400);
    }

    // Get image paths from uploaded files
    const images = req.files?.map((file) => file.path) || [];
    const booking = await Booking.create({
      resident: req.user._id,
      category,
      description,
      address,
      images,
      status: "posted",
    });

    return successResponse(res, "Booking posted successfully", booking, 201);
  } catch (err) {
    return errorResponse(res, "Failed to create booking", 500, err.message);
  }
};

/* ---------------- GET MY BOOKINGS ---------------- */
export const getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { resident: req.user._id };
    if (status && status !== "all") {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("category", "name")
      .populate({
        path: "selectedProvider",
        select: "profileImage rating userId",
        populate: { path: "userId", select: "name phone" },
      })
      .sort({ createdAt: -1 });

    // Get offer counts for posted bookings
    const bookingsWithOffers = await Promise.all(
      bookings.map(async (booking) => {
        const offerCount = await Offer.countDocuments({ booking: booking._id });
        return { ...booking.toObject(), offerCount };
      })
    );

    return successResponse(res, "My bookings", bookingsWithOffers, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch bookings", 500, err.message);
  }
};

/* ---------------- GET SINGLE BOOKING ---------------- */
export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("category", "name")
      .populate("resident", "name phone email")
      .populate({
        path: "selectedProvider",
        select: "profileImage rating experience userId skills",
        populate: { path: "userId", select: "name phone" },
      })
      .populate("selectedOffer");

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    // Check ownership
    if (booking.resident._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Unauthorized", 403);
    }

    // Get all offers
    const offers = await Offer.find({ booking: bookingId })
      .populate({
        path: "provider",
        select: "profileImage rating experience completedJobs userId skills",
        populate: { path: "userId", select: "name" },
      })
      .sort({ createdAt: -1 });

    return successResponse(res, "Booking details", { booking, offers }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch booking", 500, err.message);
  }
};

/* ---------------- GET BOOKING OFFERS ---------------- */
export const getBookingOffers = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const offers = await Offer.find({ booking: bookingId })
      .populate({
        path: "provider",
        select: "profileImage rating experience completedJobs userId skills",
        populate: { path: "userId", select: "name" },
      })
      .sort({ createdAt: -1 });

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

    if (booking.status !== "posted" && booking.status !== "offers_received") {
      return errorResponse(res, "Cannot accept offer at this stage", 400);
    }

    // Update offer status
    offer.status = "accepted";
    await offer.save();

    // Reject other offers
    await Offer.updateMany(
      { booking: booking._id, _id: { $ne: offer._id } },
      { status: "rejected" }
    );

    // Update booking
    booking.selectedProvider = offer.provider;
    booking.selectedOffer = offer._id;
    booking.providerSelectedAt = new Date();

    if (offer.inspectionRequired) {
      booking.inspection.required = true;
      booking.inspection.fee = offer.proposedInspectionFee || 0;
      booking.status = "inspection_pending";
    } else {
      // No inspection needed, set initial price from offer
      booking.finalPrice.laborCost = offer.laborEstimate;
      booking.finalPrice.totalAmount = offer.laborEstimate;
      booking.status = "awaiting_price_approval";
      booking.finalPrice.sentAt = new Date();
    }

    // Generate start OTP
    booking.otp.start.code = generateOTP();

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

    if (booking.resident.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Unauthorized", 403);
    }

    if (booking.status !== "inspection_pending") {
      return errorResponse(res, "Invalid status for this action", 400);
    }

    booking.inspection.approvedByResident = true;
    booking.status = "inspection_scheduled";

    await booking.save();

    return successResponse(res, "Inspection approved", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to approve inspection", 500, err.message);
  }
};

/* ---------------- APPROVE FINAL PRICE (After Inspection) ---------------- */
export const approveFinalPrice = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.resident.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Unauthorized", 403);
    }

    if (booking.status !== "awaiting_price_approval") {
      return errorResponse(res, "No price to approve", 400);
    }

    booking.finalPrice.approvedByResident = true;
    booking.finalPrice.approvedAt = new Date();
    booking.status = "price_approved";

    // Generate start OTP if not exists
    if (!booking.otp.start.code) {
      booking.otp.start.code = generateOTP();
    }

    await booking.save();

    return successResponse(res, "Price approved. Share OTP with worker to start.", {
      booking,
      startOTP: booking.otp.start.code,
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to approve price", 500, err.message);
  }
};

/* ---------------- REJECT FINAL PRICE ---------------- */
export const rejectFinalPrice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.resident.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Unauthorized", 403);
    }

    // Cancel booking
    booking.status = "cancelled";
    booking.cancelledBy = "resident";
    booking.cancellationReason = reason || "Price not acceptable";

    // If inspection was done, charge inspection fee
    if (booking.inspection.completedByProvider) {
      booking.cancellationFee = booking.inspection.fee || 0;
    }

    await booking.save();

    return successResponse(res, "Booking cancelled", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to reject price", 500, err.message);
  }
};

/* ---------------- CONFIRM PAYMENT ---------------- */
export const confirmPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.resident.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Unauthorized", 403);
    }

    if (booking.status !== "work_in_progress") {
      return errorResponse(res, "Work is not in progress", 400);
    }

    // Verify complete OTP
    if (booking.otp.complete.code !== otp) {
      return errorResponse(res, "Invalid OTP", 400);
    }

    // Calculate commission (only on labor)
    const laborCost = booking.finalPrice.laborCost || 0;
    const materialCost = booking.finalPrice.materialCost || 0;
    const totalAmount = booking.finalPrice.totalAmount || laborCost + materialCost;
    const commissionAmount = Math.round(laborCost * COMMISSION_RATE);
    const providerEarning = totalAmount - commissionAmount;

    // Update booking
    booking.otp.complete.verified = true;
    booking.otp.complete.verifiedAt = new Date();
    booking.paymentMethod = paymentMethod;
    booking.paymentStatus = "paid";
    booking.paidAt = new Date();
    booking.workCompletedAt = new Date();
    booking.status = "completed";
    booking.commission.amount = commissionAmount;
    booking.commission.deducted = true;
    booking.providerEarning = providerEarning;

    await booking.save();

    // Update provider wallet & stats
    await ServiceProvider.findByIdAndUpdate(booking.selectedProvider, {
      $inc: {
        walletBalance: providerEarning,
        completedJobs: 1,
      },
    });

    return successResponse(res, "Payment confirmed. Job completed!", {
      booking,
      summary: {
        totalAmount,
        laborCost,
        materialCost,
        commission: commissionAmount,
        providerEarning,
      },
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to confirm payment", 500, err.message);
  }
};

/* ---------------- CANCEL BOOKING ---------------- */
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.resident.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Unauthorized", 403);
    }

    // Cannot cancel if work is in progress or completed
    if (["work_in_progress", "completed"].includes(booking.status)) {
      return errorResponse(res, "Cannot cancel at this stage", 400);
    }

    booking.status = "cancelled";
    booking.cancelledBy = "resident";
    booking.cancellationReason = reason || "";

    // Calculate cancellation fee based on stage
    if (booking.inspection.completedByProvider) {
      booking.cancellationFee = booking.inspection.fee || 50;
    } else if (booking.selectedProvider) {
      booking.cancellationFee = 50; // Small fee for wasting provider's time
    }

    await booking.save();

    return successResponse(res, "Booking cancelled", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to cancel booking", 500, err.message);
  }
};

/* ---------------- SUBMIT REVIEW ---------------- */
export const submitReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, review } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, "Please give a rating between 1 and 5 stars", 400);
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    if (booking.resident.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Unauthorized", 403);
    }

    if (booking.status !== "completed") {
      return errorResponse(res, "Can only review completed bookings", 400);
    }

    if (booking.isReviewed) {
      return errorResponse(res, "Already reviewed", 400);
    }

    // Create simple review
    const newReview = await Review.create({
      booking: booking._id,
      resident: req.user._id,
      provider: booking.selectedProvider,
      rating,
      review: review || "",
    });

    booking.isReviewed = true;
    await booking.save();

    return successResponse(res, "Review submitted", newReview, 201);
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(res, "Already reviewed", 400);
    }
    return errorResponse(res, "Failed to submit review", 500, err.message);
  }
};