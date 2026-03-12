// models/bookingModel.js  — REDESIGNED (material cost removed, inspection flow updated)
import mongoose from "mongoose";

/* ── sub-schema for price revisions during work ── */
const priceRevisionSchema = new mongoose.Schema({
  laborCost: Number,
  totalAmount: Number,
  reason: String,
  commissionAmount: Number,
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  respondedAt: Date,
});

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true },

    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, required: true, maxlength: 1000 },
    images: { type: [String], default: [] },
    address: { type: String, required: true },

    /* ── PROVIDER ── */
    selectedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      default: null,
    },
    selectedOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      default: null,
    },

    /* ── INSPECTION (negotiable fee flow) ── */
    inspection: {
      requested: { type: Boolean, default: false },
      fee: { type: Number, default: 0 },       // provider proposed fee
      message: { type: String, default: "" },      // why inspection needed
      requestedAt: { type: Date, default: null },

      // Resident response
      status: {
        type: String,
        enum: ["none", "requested", "approved", "counter_offered", "rejected"],
        default: "none",
      },
      counterFee: { type: Number, default: 0 },       // resident counter offer
      counterMessage: { type: String, default: "" },
      respondedAt: { type: Date, default: null },

      // Final agreed fee
      agreedFee: { type: Number, default: 0 },

      // Completion
      completedByProvider: { type: Boolean, default: false },
      completedAt: { type: Date, default: null },
    },

    /* ── PRICING (labor only — material is outside the system) ── */
    finalPrice: {
      laborCost: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },     // = laborCost
      approvedByResident: { type: Boolean, default: false },
      sentAt: Date,
      approvedAt: Date,
    },

    priceRevisions: [priceRevisionSchema],

    /* ── SCHEDULE ── */
    schedule: {
      estimatedDuration: {
        value: { type: Number, default: 0 },
        unit: { type: String, enum: ["hours", "days"], default: "hours" },
      },
      scheduledStartDate: { type: Date, default: null },
      scheduledEndDate: { type: Date, default: null },
      approvedByResident: { type: Boolean, default: false },
      sentAt: Date,
      approvedAt: Date,
    },

    /* ── OTP ── */
    otp: {
      start: {
        code: String,
        verified: { type: Boolean, default: false },
        verifiedAt: Date,
      },
      complete: {
        code: String,
        verified: { type: Boolean, default: false },
        verifiedAt: Date,
      },
    },

    /* ── STATUS ── */
    status: {
      type: String,
      enum: [
        "posted",
        "offers_received",
        "provider_selected",
        "inspection_requested",     // provider requested inspection (negotiable fee)
        "inspection_approved",      // resident approved inspection (fee agreed)
        "awaiting_price_approval",
        "price_approved",
        "work_in_progress",
        "completed",
        "cancelled",
      ],
      default: "posted",
    },

    /* ── KEY DATES ── */
    providerSelectedAt: Date,
    inspectionCompletedAt: Date,
    priceApprovedAt: Date,
    workStartedAt: Date,
    workCompletedAt: Date,

    /* ── PAYMENT ── */
    paymentMethod: { type: String, enum: ["cash", "online"] },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    paidAt: Date,

    /* ── COMMISSION ── */
    commission: {
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },      // 50 = 50 %
      locked: { type: Boolean, default: false },
      lockedAt: Date,
      deducted: { type: Boolean, default: false },
      deductedAt: Date,
    },

    providerEarning: { type: Number, default: 0 },

    /* ── CANCELLATION ── */
    cancelledBy: {
      type: String,
      enum: ["resident", "provider", null],
      default: null,
    },
    cancellationReason: { type: String, default: "" },
    cancellationPenalty: {
      amount: { type: Number, default: 0 },
      paidBy: { type: String, enum: ["resident", "provider", null], default: null },
      reason: { type: String, default: "" },
    },

    /* ── REVIEW ── */
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* auto-generate bookingId */
bookingSchema.pre("save", function () {
  if (!this.bookingId) {
    const d = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    this.bookingId = `BK${d}${Math.floor(1000 + Math.random() * 9000)}`;
  }
});

bookingSchema.index({ status: 1, category: 1 });
bookingSchema.index({ selectedProvider: 1, status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;