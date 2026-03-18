// controllers/resident/bookingController.js
import Offer from "../../models/bidingOfferModel.js";
import Booking from "../../models/bookingModel.js";
import Review from "../../models/reviewModel.js";
import ServiceProvider from "../../models/service_providerModel.js";
import Wallet from "../../models/walletModel.js";
import WalletTransaction from "../../models/walletTransactionModel.js";
import { creditPlatformCommission } from "../../utills/platformWallet.js";
import { errorResponse, successResponse } from "../../utills/response.js";
import {
  calculateCommission,
  calculateCancellationPenalty,
} from "../../utills/commission.js";

const generateOTP = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

/* helper */
const getOrCreateWallet = async (pid) => {
  let w = await Wallet.findOne({ provider: pid });
  if (!w) w = await Wallet.create({ provider: pid });
  return w;
};

/* ================================================================
   CREATE BOOKING
   ================================================================ */
export const createBooking = async (req, res) => {
  try {
    const { category, description, address } = req.body;
    if (!category || !description || !address)
      return errorResponse(res, "All fields are required", 400);

    const images = req.files?.map((f) => f.path) || [];
    const booking = await Booking.create({
      resident: req.user._id,
      category, description, address, images,
      status: "posted",
    });

      const io = req.app.get("io");
    if (io) {
      io.emit("new_job_posted");
    }


    return successResponse(res, "Booking posted successfully", booking, 201);
  } catch (err) {
    return errorResponse(res, "Failed to create booking", 500, err.message);
  }
};

/* ================================================================
   GET MY BOOKINGS
   ================================================================ */
export const getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const q = { resident: req.user._id };
    if (status && status !== "all") q.status = status;

    const bookings = await Booking.find(q)
      .populate("category", "name")
      .populate({
        path: "selectedProvider",
        select: "profileImage rating userId",
        populate: { path: "userId", select: "name phone" },
      })
      .sort({ createdAt: -1 });

    const result = await Promise.all(
      bookings.map(async (b) => {
        const offerCount = await Offer.countDocuments({ booking: b._id });
        return { ...b.toObject(), offerCount };
      })
    );

    return successResponse(res, "My bookings", result, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch bookings", 500, err.message);
  }
};

/* ================================================================
   GET SINGLE BOOKING
   ================================================================ */
export const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("category", "name")
      .populate("resident", "name phone email")
      .populate({
        path: "selectedProvider",
        select: "profileImage rating experience userId skills completedJobs",
        populate: { path: "userId", select: "name phone" },
      })
      .populate("selectedOffer");

    if (!booking) return errorResponse(res, "Booking not found", 404);
    if (booking.resident._id.toString() !== req.user._id.toString())
      return errorResponse(res, "Unauthorized", 403);

    const offers = await Offer.find({ booking: req.params.bookingId })
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

/* ================================================================
   GET BOOKING OFFERS
   ================================================================ */
export const getBookingOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ booking: req.params.bookingId })
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

/* ================================================================
   ACCEPT OFFER — simplified, always goes to provider_selected
   ================================================================ */
export const acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) return errorResponse(res, "Offer not found", 404);

    const booking = await Booking.findById(offer.booking);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    if (booking.resident.toString() !== req.user._id.toString())
      return errorResponse(res, "Unauthorized", 403);

    if (!["posted", "offers_received"].includes(booking.status))
      return errorResponse(res, "Cannot accept offer at this stage", 400);

    offer.status = "accepted";
    await offer.save();

    await Offer.updateMany(
      { booking: booking._id, _id: { $ne: offer._id } },
      { status: "rejected" }
    );

    booking.selectedProvider = offer.provider;
    booking.selectedOffer = offer._id;
    booking.providerSelectedAt = new Date();

    // Always go to provider_selected — provider decides inspection later
    booking.finalPrice.laborCost = offer.laborEstimate;
    booking.finalPrice.totalAmount = offer.laborEstimate;
    booking.finalPrice.sentAt = new Date();
    booking.status = "provider_selected";

    booking.otp.start.code = generateOTP();
    await booking.save();

    req.app.get("io")?.emit("data_updated"); 

 req.app.get("io")?.to(offer.provider.toString()).emit("notification", {
      title: "🎉 Offer Accepted!",
      message: "A resident just accepted your offer. Check your active jobs!",
    });
    return successResponse(res, "Offer accepted", booking, 200);
  } catch (err) {
    return errorResponse(res, "Failed to accept offer", 500, err.message);
  }
};

/* ================================================================
   RESPOND TO INSPECTION — approve / counter / reject
   ================================================================ */
export const respondToInspection = async (req, res) => {
  try {
    const { action, counterFee, counterMessage } = req.body;
    // action: "approve" | "counter" | "reject"

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);
    if (booking.resident.toString() !== req.user._id.toString())
      return errorResponse(res, "Unauthorized", 403);
    if (booking.status !== "inspection_requested")
      return errorResponse(res, "No inspection request to respond to", 400);

    if (action === "approve") {
      booking.inspection.status = "approved";
      booking.inspection.agreedFee = booking.inspection.fee;
      booking.inspection.respondedAt = new Date();
      booking.status = "inspection_approved";
      await booking.save();
      return successResponse(res, "Inspection approved", booking, 200);
    }

    if (action === "counter") {
      if (counterFee === undefined || counterFee === null)
        return errorResponse(res, "Counter fee is required", 400);

      booking.inspection.status = "counter_offered";
      booking.inspection.counterFee = Number(counterFee);
      booking.inspection.counterMessage = counterMessage || "";
      booking.inspection.respondedAt = new Date();
      // stays in inspection_requested until provider responds
      await booking.save();
      return successResponse(res, "Counter offer sent to provider", booking, 200);
    }

    if (action === "reject") {
      booking.inspection.status = "rejected";
      booking.inspection.respondedAt = new Date();
      // go back to provider_selected — provider can send price without inspection
      booking.status = "provider_selected";
      await booking.save();
      return successResponse(res, "Inspection rejected. Provider can send price directly.", booking, 200);
    }
req.app.get("io")?.emit("data_updated");
    return errorResponse(res, "Invalid action. Use: approve, counter, reject", 400);
  } catch (err) {
    return errorResponse(res, "Failed to respond to inspection", 500, err.message);
  }
};

/* ================================================================
   APPROVE FINAL PRICE  ──  ★ LOCKS COMMISSION ★
   ================================================================ */
export const approveFinalPrice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);
    if (booking.resident.toString() !== req.user._id.toString())
      return errorResponse(res, "Unauthorized", 403);
    if (booking.status !== "awaiting_price_approval")
      return errorResponse(res, "No price to approve", 400);

    /* ── Lock commission in provider wallet ── */
    const provider = await ServiceProvider.findById(booking.selectedProvider);
    const comm = calculateCommission(
      booking.finalPrice.laborCost,
      provider?.completedJobs || 0
    );

    const wallet = await getOrCreateWallet(booking.selectedProvider);
    const available = wallet.balance - wallet.lockedAmount;

    if (available < comm.finalCommission) {
      return errorResponse(
        res,
        `Provider doesn't have enough wallet balance for commission (Rs. ${comm.finalCommission}). ` +
        `Please ask them to top up.`,
        400
      );
    }

    // Lock
    wallet.lockedAmount += comm.finalCommission;
    await wallet.save();

    await WalletTransaction.create({
      wallet: wallet._id,
      booking: booking._id,
      amount: comm.finalCommission,
      type: "lock",
      reason: `Commission locked for booking ${booking.bookingId}`,
    });

    /* ── Update booking ── */
    booking.finalPrice.approvedByResident = true;
    booking.finalPrice.approvedAt = new Date();
    booking.priceApprovedAt = new Date();

    booking.commission.rate = comm.rate;
    booking.commission.amount = comm.finalCommission;
    booking.commission.discount = comm.discount;
    booking.commission.locked = true;
    booking.commission.lockedAt = new Date();

    // Also approve schedule if sent
    if (booking.schedule.scheduledStartDate) {
      booking.schedule.approvedByResident = true;
      booking.schedule.approvedAt = new Date();
    }

    booking.status = "price_approved";

    if (!booking.otp.start.code) {
      booking.otp.start.code = generateOTP();
    }

    await booking.save();
    req.app.get("io")?.emit("data_updated"); 
    

    return successResponse(res, "Price approved. Share OTP with worker to start.", {
      booking,
      startOTP: booking.otp.start.code,
      commission: {
        amount: comm.finalCommission,
        rate: comm.ratePercent,
        discount: comm.isNewProvider ? "50% new-provider discount" : "None",
      },
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to approve price", 500, err.message);
  }
};

/* ================================================================
   REJECT FINAL PRICE
   ================================================================ */
export const rejectFinalPrice = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);
    if (booking.resident.toString() !== req.user._id.toString())
      return errorResponse(res, "Unauthorized", 403);

    const penalty = calculateCancellationPenalty(booking, "resident");

    /* unlock commission if locked */
    if (booking.commission.locked) {
      const wallet = await getOrCreateWallet(booking.selectedProvider);
      wallet.lockedAmount -= booking.commission.amount;
      await wallet.save();

      await WalletTransaction.create({
        wallet: wallet._id, booking: booking._id,
        amount: booking.commission.amount,
        type: "unlock", reason: "Commission unlocked – price rejected",
      });
      booking.commission.locked = false;
    }

    booking.status = "cancelled";
    booking.cancelledBy = "resident";
    booking.cancellationReason = reason || "Price not acceptable";
    booking.cancellationPenalty = {
      amount: penalty.amount,
      paidBy: penalty.paidBy,
      reason: penalty.reason,
    };

    await booking.save();
    req.app.get("io")?.emit("data_updated");
    return successResponse(res, "Booking cancelled", { booking, penalty }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to reject price", 500, err.message);
  }
};

/* ================================================================
   APPROVE PRICE REVISION  (during work)
   ================================================================ */
export const approvePriceRevision = async (req, res) => {
  try {
    const { bookingId, revisionId } = req.params;
    const { approve } = req.body;   // true / false

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);
    if (booking.resident.toString() !== req.user._id.toString())
      return errorResponse(res, "Unauthorized", 403);

    const revision = booking.priceRevisions.id(revisionId);
    if (!revision) return errorResponse(res, "Revision not found", 404);
    if (revision.status !== "pending")
      return errorResponse(res, "Revision already processed", 400);

    revision.respondedAt = new Date();

    if (!approve) {
      revision.status = "rejected";
      await booking.save();
      return successResponse(res, "Price revision rejected", booking, 200);
    }

    /* ── Approved: adjust locked commission ── */
    const oldComm = booking.commission.amount;
    const newComm = revision.commissionAmount;
    const diff = newComm - oldComm;
    const wallet = await getOrCreateWallet(booking.selectedProvider);

    if (diff > 0) {
      // need to lock more
      const available = wallet.balance - wallet.lockedAmount;
      if (available < diff) {
        return errorResponse(
          res,
          `Provider needs Rs. ${diff} more in wallet. Cannot approve until topped up.`,
          400
        );
      }
      wallet.lockedAmount += diff;
      await WalletTransaction.create({
        wallet: wallet._id, booking: booking._id,
        amount: diff, type: "lock",
        reason: `Additional commission locked – price revision`,
      });
    } else if (diff < 0) {
      // unlock excess
      wallet.lockedAmount += diff;     // diff is negative
      await WalletTransaction.create({
        wallet: wallet._id, booking: booking._id,
        amount: Math.abs(diff), type: "unlock",
        reason: `Commission partially unlocked – price revision`,
      });
    }
    await wallet.save();

    /* update booking price */
    revision.status = "approved";

    booking.finalPrice.laborCost = revision.laborCost;
    booking.finalPrice.totalAmount = revision.laborCost;

    booking.commission.amount = newComm;

    await booking.save();
req.app.get("io")?.emit("data_updated");
    return successResponse(res, "Price revision approved", {
      booking,
      newTotal: revision.totalAmount,
      newCommission: newComm,
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to process revision", 500, err.message);
  }
};

/* ================================================================
   APPROVE SCHEDULE UPDATE
   ================================================================ */
export const approveScheduleUpdate = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);
    if (booking.resident.toString() !== req.user._id.toString())
      return errorResponse(res, "Unauthorized", 403);

    booking.schedule.approvedByResident = true;
    booking.schedule.approvedAt = new Date();
    await booking.save();
    req.app.get("io")?.emit("data_updated");

    return successResponse(res, "Schedule approved", booking.schedule, 200);
  } catch (err) {
    return errorResponse(res, "Failed", 500, err.message);
  }
};

/* ================================================================
   CONFIRM PAYMENT  ──  ★ DEDUCTS COMMISSION ★
   ================================================================ */
export const confirmPayment = async (req, res) => {
  try {
    const { otp, paymentMethod } = req.body;
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking)
      return errorResponse(res, "Booking not found", 404);
    if (booking.resident.toString() !== req.user._id.toString())
      return errorResponse(res, "Unauthorized", 403);
    if (booking.status !== "work_in_progress")
      return errorResponse(res, "Work is not in progress", 400);
    if (booking.otp.complete.code !== otp)
      return errorResponse(res, "Invalid OTP", 400);

    const laborCost = booking.finalPrice.laborCost || 0;
    const totalAmount = laborCost;
    const commissionAmt = booking.commission.amount;
    const providerEarning = totalAmount - commissionAmt;

    /* ── Step 1: Deduct from provider wallet ── */
    const wallet = await getOrCreateWallet(booking.selectedProvider);

    wallet.balance -= commissionAmt;      // actual deduction
    wallet.lockedAmount -= commissionAmt; // unlock
    await wallet.save();

    await WalletTransaction.create({
      wallet: wallet._id,
      booking: booking._id,
      amount: commissionAmt,
      type: "debit",
      reason: `Commission deducted for booking ${booking.bookingId}`,
    });

    /* ── Step 2: Credit to PLATFORM wallet ── */
    await creditPlatformCommission({
      amount: commissionAmt,
      bookingId: booking._id,
      providerId: booking.selectedProvider,
      description: `Commission from booking ${booking.bookingId} — Labor: Rs.${laborCost}, Rate: ${booking.commission.rate * 100}%`,
    });

    /* ── Step 3: Update booking ── */
    booking.otp.complete.verified = true;
    booking.otp.complete.verifiedAt = new Date();
    booking.paymentMethod = paymentMethod;
    booking.paymentStatus = "paid";
    booking.paidAt = new Date();
    booking.workCompletedAt = new Date();
    booking.status = "completed";
    booking.commission.deducted = true;
    booking.commission.deductedAt = new Date();
    booking.providerEarning = providerEarning;

    await booking.save();

    /* ── Step 4: Update provider stats ── */
    await ServiceProvider.findByIdAndUpdate(booking.selectedProvider, {
      $inc: { completedJobs: 1 },
    });
req.app.get("io")?.emit("data_updated"); 

    return successResponse(
      res,
      "Payment confirmed. Job completed!",
      {
        booking,
        summary: {
          totalAmount,
          laborCost,
          commission: commissionAmt,
          providerEarning,
          platformEarning: commissionAmt,
        },
      },
      200
    );
  } catch (err) {
    return errorResponse(res, "Failed to confirm payment", 500, err.message);
  }
};

/* ================================================================
   CANCEL BOOKING  ──  ★ HANDLES PENALTIES ★
   ================================================================ */
export const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);
    if (booking.resident.toString() !== req.user._id.toString())
      return errorResponse(res, "Unauthorized", 403);
    if (["completed", "cancelled"].includes(booking.status))
      return errorResponse(res, "Cannot cancel", 400);

    const penalty = calculateCancellationPenalty(booking, "resident");

    /* ── unlock commission ── */
    if (booking.commission.locked && booking.selectedProvider) {
      const wallet = await getOrCreateWallet(booking.selectedProvider);
      wallet.lockedAmount -= booking.commission.amount;
      await wallet.save();

      await WalletTransaction.create({
        wallet: wallet._id, booking: booking._id,
        amount: booking.commission.amount,
        type: "unlock", reason: "Commission unlocked – resident cancelled",
      });
      booking.commission.locked = false;
    }

    booking.status = "cancelled";
    booking.cancelledBy = "resident";
    booking.cancellationReason = reason || "";
    booking.cancellationPenalty = {
      amount: penalty.amount,
      paidBy: penalty.paidBy,
      reason: penalty.reason,
    };

    await booking.save();
req.app.get("io")?.emit("data_updated");
    return successResponse(res, "Booking cancelled", { booking, penalty }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to cancel booking", 500, err.message);
  }
};

/* ================================================================
   SUBMIT REVIEW
   ================================================================ */
export const submitReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return errorResponse(res, "Rating must be 1–5", 400);

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return errorResponse(res, "Booking not found", 404);
    if (booking.resident.toString() !== req.user._id.toString())
      return errorResponse(res, "Unauthorized", 403);
    if (booking.status !== "completed")
      return errorResponse(res, "Can only review completed bookings", 400);
    if (booking.isReviewed)
      return errorResponse(res, "Already reviewed", 400);

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
    if (err.code === 11000) return errorResponse(res, "Already reviewed", 400);
    return errorResponse(res, "Failed to submit review", 500, err.message);
  }
};