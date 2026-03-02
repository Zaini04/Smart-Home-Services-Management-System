// controllers/provider/bookingController.js
import Offer from "../../models/bidingOfferModel.js";
import Booking from "../../models/bookingModel.js";
import ServiceProvider from "../../models/service_providerModel.js";
import Wallet from "../../models/walletModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

// Generate OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

/* ---------------- GET AVAILABLE BOOKINGS ---------------- */
// controllers/provider/bookingController.js

export const getAvailableBookings = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user._id });

    if (!provider) {
      return errorResponse(res, "Provider profile not found", 404);
    }

    if (provider.kycStatus !== "approved") {
      return errorResponse(res, "Your profile is not approved yet", 403);
    }

    // ✅ FIX: Include BOTH "posted" AND "offers_received" statuses
    const bookings = await Booking.find({
      status: { $in: ["posted", "offers_received"] },  // ← FIXED!
    })
      .populate("resident", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    // Check if provider already bid on each
    const bookingsWithBidStatus = await Promise.all(
      bookings.map(async (booking) => {
        const myOffer = await Offer.findOne({
          booking: booking._id,
          provider: provider._id,
        });
        const offerCount = await Offer.countDocuments({ booking: booking._id });
        return {
          ...booking.toObject(),
          hasBid: !!myOffer,
          myOffer,
          offerCount,
        };
      })
    );

    return successResponse(res, "Available bookings", bookingsWithBidStatus, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch bookings", 500, err.message);
  }
};
/* ---------------- SEND / UPDATE OFFER ---------------- */
export const sendOrUpdateOffer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { laborEstimate, message, inspectionRequired, proposedInspectionFee } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) {
      return errorResponse(res, "Provider not found", 404);
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    if (booking.status !== "posted" && booking.status !== "offers_received") {
      return errorResponse(res, "Booking is not accepting offers", 400);
    }

    // Check wallet balance (optional - can remove if not needed)
    const wallet = await Wallet.findOne({ provider: provider._id });
    if (wallet && wallet.balance < 0) {
      return errorResponse(res, "Insufficient wallet balance", 400);
    }

    const offer = await Offer.findOneAndUpdate(
      { booking: bookingId, provider: provider._id },
      {
        laborEstimate,
        message,
        inspectionRequired: inspectionRequired || false,
        proposedInspectionFee: proposedInspectionFee || 0,
        status: "pending",
      },
      { upsert: true, new: true }
    );

    // Update booking status if first offer
    if (booking.status === "posted") {
      const offerCount = await Offer.countDocuments({ booking: bookingId });
      if (offerCount > 0) {
        booking.status = "offers_received";
        await booking.save();
      }
    }

    return successResponse(res, "Offer submitted", offer, 200);
  } catch (err) {
    return errorResponse(res, "Failed to submit offer", 500, err.message);
  }
};

/* ---------------- GET MY JOBS (Assigned to me) ---------------- */
export const getMyJobs = async (req, res) => {
  try {
    const { status } = req.query;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) {
      return errorResponse(res, "Provider not found", 404);
    }

    const query = { selectedProvider: provider._id };
    if (status && status !== "all") {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("resident", "name phone address")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return successResponse(res, "My jobs", bookings, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch jobs", 500, err.message);
  }
};

/* ---------------- GET MY OFFERS ---------------- */
export const getMyOffers = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) {
      return errorResponse(res, "Provider not found", 404);
    }

    const offers = await Offer.find({ provider: provider._id })
      .populate({
        path: "booking",
        select: "description address status images createdAt",
        populate: { path: "resident", select: "name" },
      })
      .sort({ createdAt: -1 });

    return successResponse(res, "My offers", offers, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch offers", 500, err.message);
  }
};

/* ---------------- GET JOB DETAILS ---------------- */
export const getJobDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) {
      return errorResponse(res, "Provider not found", 404);
    }

    const booking = await Booking.findById(bookingId)
      .populate("resident", "name phone email address")
      .populate("category", "name")
      .populate("selectedOffer");

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    // Check if this provider is assigned
    if (booking.selectedProvider?.toString() !== provider._id.toString()) {
      return errorResponse(res, "Not assigned to this job", 403);
    }

    return successResponse(res, "Job details", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch job", 500, err.message);
  }
};

/* ---------------- VERIFY START OTP & MARK ARRIVED ---------------- */
export const verifyStartOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);

    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString()) {
      return errorResponse(res, "Not assigned to this job", 403);
    }

    if (!["price_approved", "inspection_scheduled"].includes(booking.status)) {
      return errorResponse(res, "Invalid status for this action", 400);
    }

    if (booking.otp.start.code !== otp) {
      return errorResponse(res, "Invalid OTP", 400);
    }

    booking.otp.start.verified = true;
    booking.otp.start.verifiedAt = new Date();

    // If inspection is required, mark as inspection in progress
    if (booking.inspection.required && !booking.inspection.completedByProvider) {
      booking.status = "inspection_scheduled";
    }

    await booking.save();

    return successResponse(res, "OTP verified. You can start now.", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to verify OTP", 500, err.message);
  }
};

/* ---------------- COMPLETE INSPECTION & SEND FINAL PRICE ---------------- */
export const completeInspection = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { laborCost, materialCost, materialDescription } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);

    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString()) {
      return errorResponse(res, "Not assigned to this job", 403);
    }

    const labor = Number(laborCost) || 0;
    const material = Number(materialCost) || 0;
    const total = labor + material;

    booking.inspection.completedByProvider = true;
    booking.inspectionCompletedAt = new Date();

    booking.finalPrice.laborCost = labor;
    booking.finalPrice.materialCost = material;
    booking.finalPrice.materialDescription = materialDescription || "";
    booking.finalPrice.totalAmount = total;
    booking.finalPrice.sentAt = new Date();

    booking.status = "awaiting_price_approval";

    await booking.save();

    // Calculate preview for worker
    const commission = Math.round(labor * 0.15);
    const earning = total - commission;

    return successResponse(res, "Inspection completed. Price sent to resident.", {
      booking,
      preview: {
        totalAmount: total,
        laborCost: labor,
        materialCost: material,
        commission,
        yourEarning: earning,
      },
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to complete inspection", 500, err.message);
  }
};

/* ---------------- SEND FINAL PRICE (Without Inspection) ---------------- */
export const sendFinalPrice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { laborCost, materialCost, materialDescription } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);

    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString()) {
      return errorResponse(res, "Not assigned to this job", 403);
    }

    const labor = Number(laborCost) || 0;
    const material = Number(materialCost) || 0;
    const total = labor + material;

    booking.finalPrice.laborCost = labor;
    booking.finalPrice.materialCost = material;
    booking.finalPrice.materialDescription = materialDescription || "";
    booking.finalPrice.totalAmount = total;
    booking.finalPrice.sentAt = new Date();

    booking.status = "awaiting_price_approval";

    await booking.save();

    const commission = Math.round(labor * 0.15);
    const earning = total - commission;

    return successResponse(res, "Price sent to resident", {
      booking,
      preview: {
        totalAmount: total,
        laborCost: labor,
        materialCost: material,
        commission,
        yourEarning: earning,
      },
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to send price", 500, err.message);
  }
};

/* ---------------- START WORK ---------------- */
export const startWork = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);

    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString()) {
      return errorResponse(res, "Not assigned to this job", 403);
    }

    if (booking.status !== "price_approved") {
      return errorResponse(res, "Price not approved yet", 400);
    }

    if (!booking.otp.start.verified) {
      return errorResponse(res, "Start OTP not verified", 400);
    }

    booking.status = "work_in_progress";
    booking.workStartedAt = new Date();

    // Generate complete OTP
    booking.otp.complete.code = generateOTP();

    await booking.save();

    return successResponse(res, "Work started. Complete OTP sent to resident.", {
      booking,
      completeOTP: booking.otp.complete.code, // Worker can also see it
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to start work", 500, err.message);
  }
};

/* ---------------- COMPLETE WORK ---------------- */
export const completeWork = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);

    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString()) {
      return errorResponse(res, "Not assigned to this job", 403);
    }

    if (booking.status !== "work_in_progress") {
      return errorResponse(res, "Work not in progress", 400);
    }

    // Work is done, now waiting for resident to confirm payment with OTP
    return successResponse(res, "Ask resident to confirm payment with OTP", {
      booking,
      message: "Resident needs to enter complete OTP and confirm payment",
      totalAmount: booking.finalPrice.totalAmount,
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to complete work", 500, err.message);
  }
};

/* ---------------- GET DASHBOARD ---------------- */
export const getDashboard = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user._id })
      .populate("userId", "name email phone");

    if (!provider) {
      return errorResponse(res, "Provider not found", 404);
    }

    // Stats
    const totalJobs = await Booking.countDocuments({ selectedProvider: provider._id });
    const completedJobs = await Booking.countDocuments({
      selectedProvider: provider._id,
      status: "completed",
    });
    const activeJobs = await Booking.countDocuments({
      selectedProvider: provider._id,
      status: { $in: ["provider_selected", "inspection_pending", "inspection_scheduled", "awaiting_price_approval", "price_approved", "work_in_progress"] },
    });
    const pendingOffers = await Offer.countDocuments({
      provider: provider._id,
      status: "pending",
    });

    // Available jobs to bid
    const availableJobs = await Booking.countDocuments({ status: "posted" });

    // Recent jobs
    const recentJobs = await Booking.find({ selectedProvider: provider._id })
      .populate("resident", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayJobs = await Booking.find({
      selectedProvider: provider._id,
      status: "completed",
      completedAt: { $gte: today },
    });

    const todayEarnings = todayJobs.reduce((sum, job) => sum + (job.providerEarning || 0), 0);

    return successResponse(res, "Dashboard", {
      provider: {
        name: provider.userId.name,
        profileImage: provider.profileImage,
        status: provider.status,
        rating: provider.rating,
        ratingCount: provider.ratingCount,
        walletBalance: provider.walletBalance,
        kycStatus: provider.kycStatus,
      },
      stats: {
        totalJobs,
        completedJobs,
        activeJobs,
        pendingOffers,
        availableJobs,
        todayEarnings,
      },
      recentJobs,
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch dashboard", 500, err.message);
  }
};