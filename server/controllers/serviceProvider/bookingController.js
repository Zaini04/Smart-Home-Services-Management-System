// controllers/serviceProvider/bookingController.js
import Offer from "../../models/bidingOfferModel.js";
import Booking from "../../models/bookingModel.js";
import ServiceProvider from "../../models/service_providerModel.js";
import Wallet from "../../models/walletModel.js";
import WalletTransaction from "../../models/walletTransactionModel.js";
import { creditPlatformPenalty } from "../../utills/platformWallet.js";
import { errorResponse, successResponse } from "../../utills/response.js";
import { sendNotification } from "../../utills/notify.js";
import {
  calculateCommission,
  calculateCancellationPenalty,
  MIN_WALLET_BALANCE,
} from "../../utills/commission.js";
import {
  checkScheduleConflict,
  calculateEndDate,
} from "../../utills/scheduleCheck.js";

const generateOTP = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

/* helper */
const getOrCreateWallet = async (pid) => {
  let w = await Wallet.findOne({ provider: pid });
  if (!w) w = await Wallet.create({ provider: pid });
  return w;
};

/* ================================================================
   GET AVAILABLE BOOKINGS
   ================================================================ */
export const getAvailableBookings = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return errorResponse(res, "Provider profile not found", 404);
    if (provider.kycStatus !== "approved")
      return errorResponse(res, "Your profile is not approved yet", 403);

    // ── wallet check (show warning, don't block viewing) ──
    const wallet = await getOrCreateWallet(provider._id);
    const canSendOffers = wallet.balance >= MIN_WALLET_BALANCE;

    const bookings = await Booking.find({
      status: { $in: ["posted", "offers_received"] },
    })
      .populate("resident", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    const result = await Promise.all(
      bookings.map(async (b) => {
        const myOffer = await Offer.findOne({ booking: b._id, provider: provider._id });
        const offerCount = await Offer.countDocuments({ booking: b._id });
        return { ...b.toObject(), hasBid: !!myOffer, myOffer, offerCount };
      })
    );

    return successResponse(res, "Available bookings", {
      bookings: result,
      walletWarning: !canSendOffers
        ? `Wallet balance (Rs. ${wallet.balance}) is below Rs. ${MIN_WALLET_BALANCE}. Top up to send offers.`
        : null,
      canSendOffers,
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch bookings", 500, err.message);
  }
};

/* ================================================================
   SEND / UPDATE OFFER  —  no inspection fields
   ================================================================ */
export const sendOrUpdateOffer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { laborEstimate, message } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return errorResponse(res, "Provider not found", 404);

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (!["posted", "offers_received"].includes(booking.status))
      return errorResponse(res, "Booking is not accepting offers", 400);

    /* ── Wallet gate ── */
    const wallet = await getOrCreateWallet(provider._id);
    if (wallet.balance < MIN_WALLET_BALANCE) {
      return errorResponse(
        res,
        `Minimum wallet balance of Rs. ${MIN_WALLET_BALANCE} required to send offers. ` +
        `Your balance: Rs. ${wallet.balance}. Please top up.`,
        400
      );
    }

    /* ── Commission preview ── */
    const preview = calculateCommission(
      Number(laborEstimate),
      provider.completedJobs || 0
    );

    const offer = await Offer.findOneAndUpdate(
      { booking: bookingId, provider: provider._id },
      {
        laborEstimate,
        message: message || "",
        status: "pending",
      },
      { upsert: true, new: true }
    );

    if (booking.status === "posted") {
      booking.status = "offers_received";
      await booking.save();
    }
    
    req.app.get("io")?.emit("data_updated"); 
    await sendNotification(req, booking.resident, "📝 New Offer Received!", `A worker has sent a quote of Rs. ${laborEstimate} for your job.`);

    return successResponse(res, "Offer submitted", {
      offer,
      commissionPreview: {
        laborEstimate: Number(laborEstimate),
        commissionRate: preview.ratePercent,
        estimatedCommission: preview.finalCommission,
        estimatedEarning: preview.providerKeeps,
        newProviderDiscount: preview.isNewProvider ? "50% off (first 5 jobs)" : null,
      },
      walletBalance: wallet.balance,
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to submit offer", 500, err.message);
  }
};

/* ================================================================
   REQUEST INSPECTION  —  provider proposes fee + message
   Only from provider_selected status
   ================================================================ */
export const requestInspection = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { fee, message: msg, scheduledDate, scheduledTime } = req.body; 

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString())
      return errorResponse(res, "Not assigned", 403);

    if (booking.status !== "provider_selected")
      return errorResponse(res, "Cannot request inspection at this stage", 400);

    booking.inspection.requested = true;
    booking.inspection.fee = Number(fee) || 0;
    booking.inspection.message = msg || "";
    booking.inspection.scheduledDate = scheduledDate ? new Date(scheduledDate) : null; 
    booking.inspection.scheduledTime = scheduledTime || ""; 
    booking.inspection.requestedAt = new Date();
    booking.inspection.status = "requested";

    booking.status = "inspection_requested";
    await booking.save();
    
    req.app.get("io")?.emit("data_updated");
    await sendNotification(req, booking.resident, "🔍 Inspection Requested", "The worker needs to inspect the issue before giving a final price.");
    
    return successResponse(
      res,
      "Inspection requested. Waiting for resident approval.",
      booking,
      200
    );
  } catch (err) {
    return errorResponse(res, "Failed to request inspection", 500, err.message);
  }
};

/* ================================================================
   RESPOND TO COUNTER FEE  —  provider accepts or re-proposes
   ================================================================ */
export const respondToCounterFee = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action, newFee, message: msg } = req.body;
    // action: "accept" | "re_propose"

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString())
      return errorResponse(res, "Not assigned", 403);

    if (booking.inspection.status !== "counter_offered")
      return errorResponse(res, "No counter offer to respond to", 400);

    if (action === "accept") {
      booking.inspection.agreedFee = booking.inspection.counterFee;
      booking.inspection.status = "approved";
      booking.status = "inspection_approved";
      await booking.save();
      
      req.app.get("io")?.emit("data_updated");
      await sendNotification(req, booking.resident, "🔍 Counter Fee Accepted", "The worker accepted your counter fee.");
      
      return successResponse(res, "Counter fee accepted. Inspection approved.", booking, 200);
    }

    if (action === "re_propose") {
      if (!newFee && newFee !== 0)
        return errorResponse(res, "New fee is required", 400);

      booking.inspection.fee = Number(newFee);
      booking.inspection.message = msg || booking.inspection.message;
      booking.inspection.status = "requested";
      booking.inspection.requestedAt = new Date();
      // stays at inspection_requested
      await booking.save();
      
      req.app.get("io")?.emit("data_updated");
      await sendNotification(req, booking.resident, "🔍 New Inspection Fee", "The worker proposed a new inspection fee.");
      
      return successResponse(res, "New fee proposed to resident", booking, 200);
    }
    
    return errorResponse(res, "Invalid action. Use: accept, re_propose", 400);
  } catch (err) {
    return errorResponse(res, "Failed to respond to counter fee", 500, err.message);
  }
};

/* ================================================================
   COMPLETE INSPECTION  →  send final labor cost + schedule
   ================================================================ */
export const completeInspection = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      laborCost,
      scheduledStartDate,
      estimatedDurationValue,
      estimatedDurationUnit,     // "hours" | "days"
    } = req.body;

    if (!scheduledStartDate) {
      return errorResponse(
        res,
        "Scheduled start date is required. Please specify when you'll start the work.",
        400
      );
    }

    if (!estimatedDurationValue || !estimatedDurationUnit) {
      return errorResponse(
        res,
        "Estimated duration is required (e.g., 2 hours or 3 days).",
        400
      );
    }

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString())
      return errorResponse(res, "Not assigned to this job", 403);

    if (booking.status !== "inspection_approved")
      return errorResponse(res, "Inspection not approved yet", 400);

    const labor = Number(laborCost) || 0;

    /* ── commission preview + wallet check ── */
    const comm = calculateCommission(labor, provider.completedJobs || 0);
    const wallet = await getOrCreateWallet(provider._id);
    const available = wallet.balance - wallet.lockedAmount;

    if (available < comm.finalCommission) {
      return errorResponse(
        res,
        `Insufficient wallet balance for commission. ` +
        `Required: Rs. ${comm.finalCommission}, Available: Rs. ${available}. Please top up.`,
        400
      );
    }

    /* ── schedule conflict check ── */
    const duration = {
      value: Number(estimatedDurationValue) || 1,
      unit: estimatedDurationUnit || "hours",
    };
    const conflict = await checkScheduleConflict(
      provider._id, scheduledStartDate, duration, booking._id
    );
    if (conflict.hasConflict) {
      return errorResponse(
        res,
        `Schedule conflict with booking ${conflict.conflictWith.bookingId}. ` +
        `Required gap: ${conflict.conflictWith.requiredGap}.`,
        400
      );
    }

    booking.schedule.estimatedDuration = duration;
    booking.schedule.scheduledStartDate = new Date(scheduledStartDate);
    booking.schedule.scheduledEndDate = calculateEndDate(scheduledStartDate, duration);
    booking.schedule.sentAt = new Date();

    /* ── update booking ── */
    booking.inspection.completedByProvider = true;
    booking.inspection.completedAt = new Date();
    booking.inspectionCompletedAt = new Date();

    booking.finalPrice.laborCost = labor;
    booking.finalPrice.totalAmount = labor;
    booking.finalPrice.sentAt = new Date();

    booking.commission.rate = comm.rate;
    booking.commission.amount = comm.finalCommission;
    booking.commission.discount = comm.discount;

    booking.status = "awaiting_price_approval";
    await booking.save();

    req.app.get("io")?.emit("data_updated"); 
    await sendNotification(req, booking.resident, "💰 Final Price Received", `The worker has sent the final schedule and labor cost (Rs. ${laborCost}). Please approve.`);

    return successResponse(res, "Inspection done. Price sent to resident.", {
      booking,
      commissionInfo: {
        totalAmount: labor,
        laborCost: labor,
        commission: comm.finalCommission,
        yourEarning: labor - comm.finalCommission,
        discountApplied: comm.isNewProvider ? "50% new-provider discount" : "None",
      },
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to complete inspection", 500, err.message);
  }
};

/* ================================================================
   SEND FINAL PRICE (without inspection) + schedule
   From provider_selected — provider sends labor cost directly
   ================================================================ */
export const sendFinalPrice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      laborCost,
      scheduledStartDate,
      estimatedDurationValue,
      estimatedDurationUnit,
    } = req.body;

    if (!scheduledStartDate) {
      return errorResponse(
        res,
        "Scheduled start date is required. Please specify when you'll start the work.",
        400
      );
    }

    if (!estimatedDurationValue || !estimatedDurationUnit) {
      return errorResponse(
        res,
        "Estimated duration is required (e.g., 2 hours or 3 days).",
        400
      );
    }

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return errorResponse(res, "Provider not found", 404);

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString())
      return errorResponse(res, "Not assigned to this job", 403);

    if (booking.status !== "provider_selected")
      return errorResponse(res, "Cannot send price at this stage", 400);

    const labor = Number(laborCost) || 0;

    /* ── commission + wallet ── */
    const comm = calculateCommission(labor, provider.completedJobs || 0);
    const wallet = await getOrCreateWallet(provider._id);
    const available = wallet.balance - wallet.lockedAmount;

    if (available < comm.finalCommission) {
      return errorResponse(
        res,
        `Insufficient wallet for commission. Need Rs. ${comm.finalCommission}, have Rs. ${available}.`,
        400
      );
    }

    /* ── schedule conflict ── */
    const duration = {
      value: Number(estimatedDurationValue) || 1,
      unit: estimatedDurationUnit || "hours",
    };
    const conflict = await checkScheduleConflict(
      provider._id, scheduledStartDate, duration, booking._id
    );
    if (conflict.hasConflict) {
      return errorResponse(
        res,
        `Schedule conflict with ${conflict.conflictWith.bookingId}. Gap required: ${conflict.conflictWith.requiredGap}.`,
        400
      );
    }

    booking.schedule.estimatedDuration = duration;
    booking.schedule.scheduledStartDate = new Date(scheduledStartDate);
    booking.schedule.scheduledEndDate = calculateEndDate(scheduledStartDate, duration);
    booking.schedule.sentAt = new Date();

    /* ── update booking ── */
    booking.finalPrice.laborCost = labor;
    booking.finalPrice.totalAmount = labor;
    booking.finalPrice.sentAt = new Date();

    booking.commission.rate = comm.rate;
    booking.commission.amount = comm.finalCommission;
    booking.commission.discount = comm.discount;

    booking.status = "awaiting_price_approval";
    await booking.save();

    req.app.get("io")?.emit("data_updated"); 
    await sendNotification(req, booking.resident, "💰 Final Price Received", `The worker has sent the final schedule and labor cost (Rs. ${laborCost}). Please approve.`);
    
    return successResponse(res, "Price sent to resident", {
      booking,
      commissionInfo: {
        totalAmount: labor,
        laborCost: labor,
        commission: comm.finalCommission,
        yourEarning: labor - comm.finalCommission,
        discountApplied: comm.isNewProvider ? "50% new-provider discount" : "None",
      },
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to send price", 500, err.message);
  }
};

/* ================================================================
   UPDATE PRICE DURING WORK  (price revision — labor only)
   ================================================================ */
export const updatePriceDuringWork = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { laborCost, reason } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString())
      return errorResponse(res, "Not assigned", 403);

    if (booking.status !== "work_in_progress")
      return errorResponse(res, "Can only revise price during work", 400);

    const labor = Number(laborCost) || 0;

    /* ── new commission calc ── */
    const comm = calculateCommission(labor, provider.completedJobs || 0);
    const oldComm = booking.commission.amount;
    const diff = comm.finalCommission - oldComm;

    /* if commission increases, check wallet */
    if (diff > 0) {
      const wallet = await getOrCreateWallet(provider._id);
      const available = wallet.balance - wallet.lockedAmount;
      if (available < diff) {
        return errorResponse(
          res,
          `Need Rs. ${diff} more in wallet for updated commission. Available: Rs. ${available}.`,
          400
        );
      }
    }

    /* ── push revision (pending resident approval) ── */
    booking.priceRevisions.push({
      laborCost: labor,
      totalAmount: labor,
      reason: reason || "",
      commissionAmount: comm.finalCommission,
      sentAt: new Date(),
      status: "pending",
    });

    await booking.save();

    req.app.get("io")?.emit("data_updated"); 
    await sendNotification(req, booking.resident, "📝 Price Revision!", `A worker has sent a revision of Rs. ${labor} for your job.`);
    
    return successResponse(res, "Price revision sent to resident for approval", {
      revision: booking.priceRevisions.at(-1),
      commissionInfo: {
        oldCommission: oldComm,
        newCommission: comm.finalCommission,
        difference: diff,
      },
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to update price", 500, err.message);
  }
};

/* ================================================================
   UPDATE SCHEDULE DURING WORK
   ================================================================ */
export const updateSchedule = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { estimatedDurationValue, estimatedDurationUnit, scheduledStartDate } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString())
      return errorResponse(res, "Not assigned", 403);

    if (!["price_approved", "work_in_progress"].includes(booking.status))
      return errorResponse(res, "Cannot update schedule at this stage", 400);

    const duration = {
      value: Number(estimatedDurationValue) || booking.schedule.estimatedDuration.value,
      unit: estimatedDurationUnit || booking.schedule.estimatedDuration.unit,
    };
    const start = scheduledStartDate
      ? new Date(scheduledStartDate)
      : booking.schedule.scheduledStartDate;

    if (start) {
      const conflict = await checkScheduleConflict(
        provider._id, start, duration, booking._id
      );
      if (conflict.hasConflict)
        return errorResponse(res, `Conflict with ${conflict.conflictWith.bookingId}`, 400);
    }

    booking.schedule.estimatedDuration = duration;
    booking.schedule.scheduledStartDate = start;
    booking.schedule.scheduledEndDate = start ? calculateEndDate(start, duration) : null;
    booking.schedule.approvedByResident = false;   // needs re-approval
    booking.schedule.sentAt = new Date();

    await booking.save();

    req.app.get("io")?.emit("data_updated"); 
    await sendNotification(req, booking.resident, "📝 Schedule Update!", "A worker has sent a schedule update for your job. Please review and approve.");
    
    return successResponse(res, "Schedule update sent for approval", booking.schedule, 200);
  } catch (err) {
    return errorResponse(res, "Failed to update schedule", 500, err.message);
  }
};

/* ================================================================
   VERIFY START OTP
   ================================================================ */
export const verifyStartOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString())
      return errorResponse(res, "Not assigned", 403);

    if (!["price_approved", "inspection_approved"].includes(booking.status))
      return errorResponse(res, "Invalid status for this action", 400);

    if (booking.otp.start.code !== otp)
      return errorResponse(res, "Invalid OTP", 400);

    booking.otp.start.verified = true;
    booking.otp.start.verifiedAt = new Date();

    await booking.save();
    req.app.get("io")?.emit("data_updated");
    return successResponse(res, "OTP verified. You can proceed.", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to verify OTP", 500, err.message);
  }
};

/* ================================================================
   START WORK
   ================================================================ */
export const startWork = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString())
      return errorResponse(res, "Not assigned", 403);

    if (booking.status !== "price_approved")
      return errorResponse(res, "Price not approved yet", 400);

    if (!booking.otp.start.verified)
      return errorResponse(res, "Start OTP not verified yet", 400);

    if (!booking.commission.locked)
      return errorResponse(res, "Commission not locked. Ask resident to re-approve.", 400);

    booking.status = "work_in_progress";
    booking.workStartedAt = new Date();
    booking.otp.complete.code = generateOTP();

    await booking.save();
    
    req.app.get("io")?.emit("data_updated");
    await sendNotification(req, booking.resident, "📝 Work Started!", "A worker has started working on your job.");
    
    return successResponse(res, "Work started!", {
      booking,
      completeOTP: booking.otp.complete.code,
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to start work", 500, err.message);
  }
};

/* ================================================================
   COMPLETE WORK  (provider says "I'm done")
   ================================================================ */
export const completeWork = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.selectedProvider?.toString() !== provider._id.toString())
      return errorResponse(res, "Not assigned", 403);

    if (booking.status !== "work_in_progress")
      return errorResponse(res, "Work not in progress", 400);

    req.app.get("io")?.emit("data_updated");
    await sendNotification(req, booking.resident, "📝 Work Completed!", "A worker has completed the job.");

    return successResponse(
      res,
      "Ask resident to confirm payment with the Complete OTP",
      {
        totalAmount: booking.finalPrice.totalAmount,
        laborCost: booking.finalPrice.laborCost,
      },
      200
    );
  } catch (err) {
    return errorResponse(res, "Failed", 500, err.message);
  }
};

/* ================================================================
   PROVIDER CANCEL JOB
   ================================================================ */
export const providerCancelJob = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);

    if (!booking) return errorResponse(res, "Booking not found", 404);
    if (booking.selectedProvider?.toString() !== provider._id.toString())
      return errorResponse(res, "Not assigned", 403);
    if (booking.status === "completed")
      return errorResponse(res, "Job already completed", 400);

    const penalty = calculateCancellationPenalty(booking, "provider");
    const wallet = await getOrCreateWallet(provider._id);

    /* ── Unlock any locked commission ── */
    if (booking.commission.locked) {
      wallet.lockedAmount -= booking.commission.amount;
      await WalletTransaction.create({
        wallet: wallet._id,
        booking: booking._id,
        amount: booking.commission.amount,
        type: "unlock",
        reason: "Commission unlocked – provider cancelled",
      });
      booking.commission.locked = false;
    }

    /* ── Deduct penalty from provider wallet ── */
    if (penalty.amount > 0) {
      wallet.balance -= penalty.amount;
      await WalletTransaction.create({
        wallet: wallet._id,
        booking: booking._id,
        amount: penalty.amount,
        type: "debit",
        reason: `Cancellation penalty: ${penalty.reason}`,
      });

      /* ── Credit penalty to PLATFORM ── */
      await creditPlatformPenalty({
        amount: penalty.amount,
        bookingId: booking._id,
        providerId: provider._id,
        description: `Provider cancellation penalty for ${booking.bookingId}: ${penalty.reason}`,
      });
    }

    await wallet.save();

    booking.status = "cancelled";
    booking.cancelledBy = "provider";
    booking.cancellationReason = reason || "";
    booking.cancellationPenalty = {
      amount: penalty.amount,
      paidBy: penalty.paidBy,
      reason: penalty.reason,
    };

    await booking.save();
    
    req.app.get("io")?.emit("data_updated");
    await sendNotification(req, booking.resident, "📝 Job Cancelled!", "A worker has cancelled the job.");

    return successResponse(
      res,
      "Job cancelled",
      {
        booking,
        penalty,
        walletBalance: wallet.balance,
      },
      200
    );
  } catch (err) {
    return errorResponse(res, "Failed to cancel", 500, err.message);
  }
};

/* ================================================================
   GET MY JOBS
   ================================================================ */
export const getMyJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return errorResponse(res, "Provider not found", 404);

    const q = { selectedProvider: provider._id };
    if (status && status !== "all") q.status = status;

    const bookings = await Booking.find(q)
      .populate("resident", "name phone address")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return successResponse(res, "My jobs", bookings, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch jobs", 500, err.message);
  }
};

/* ================================================================
   GET MY OFFERS
   ================================================================ */
export const getMyOffers = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return errorResponse(res, "Provider not found", 404);

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

/* ================================================================
   GET JOB DETAILS
   ================================================================ */
export const getJobDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return errorResponse(res, "Provider not found", 404);

    const booking = await Booking.findById(bookingId)
      .populate("resident", "name phone email address")
      .populate("category", "name")
      .populate("selectedOffer");

    if (!booking) return errorResponse(res, "Booking not found", 404);
    if (booking.selectedProvider?.toString() !== provider._id.toString())
      return errorResponse(res, "Not assigned to this job", 403);

    return successResponse(res, "Job details", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch job", 500, err.message);
  }
};

/* ================================================================
   DASHBOARD
   ================================================================ */
export const getDashboard = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user._id })
      .populate("userId", "name email phone");
    if (!provider) return errorResponse(res, "Provider not found", 404);

    const wallet = await getOrCreateWallet(provider._id);

    const [totalJobs, completedJobs, activeJobs, pendingOffers, availableJobs] =
      await Promise.all([
        Booking.countDocuments({ selectedProvider: provider._id }),
        Booking.countDocuments({ selectedProvider: provider._id, status: "completed" }),
        Booking.countDocuments({
          selectedProvider: provider._id,
          status: {
            $in: [
              "provider_selected", "inspection_requested", "inspection_approved",
              "awaiting_price_approval", "price_approved", "work_in_progress",
            ]
          },
        }),
        Offer.countDocuments({ provider: provider._id, status: "pending" }),
        Booking.countDocuments({ status: { $in: ["posted", "offers_received"] } }),
      ]);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayDone = await Booking.find({
      selectedProvider: provider._id,
      status: "completed",
      workCompletedAt: { $gte: today },
    });
    const todayEarnings = todayDone.reduce((s, j) => s + (j.providerEarning || 0), 0);

    return successResponse(res, "Dashboard", {
      provider: {
        name: provider.userId.name,
        profileImage: provider.profileImage,
        status: provider.status,
        rating: provider.rating,
        ratingCount: provider.ratingCount,
        kycStatus: provider.kycStatus,
      },
      wallet: {
        balance: wallet.balance,
        lockedAmount: wallet.lockedAmount,
        availableBalance: wallet.balance - wallet.lockedAmount,
        canSendOffers: wallet.balance >= MIN_WALLET_BALANCE,
      },
      stats: {
        totalJobs,
        completedJobs,
        activeJobs,
        pendingOffers,
        availableJobs,
        todayEarnings,
        isNewProvider: (provider.completedJobs || 0) < 5,
        freeJobsLeft: Math.max(0, 5 - (provider.completedJobs || 0)),
      },
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch dashboard", 500, err.message);
  }
};