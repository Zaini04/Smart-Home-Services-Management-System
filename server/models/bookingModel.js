// models/bookingModel.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    /* ---------------- BASIC INFO ---------------- */
    bookingId: {
      type: String,
      unique: true,
    },

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

    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    images: {
      type: [String],
      default: [],
    },

    address: {
      type: String,
      required: true,
    },

    /* ---------------- PROVIDER ---------------- */
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

    /* ---------------- INSPECTION ---------------- */
    inspection: {
      required: {
        type: Boolean,
        default: false,
      },
      fee: {
        type: Number,
        default: 0,
      },
      scheduledAt: {
        type: Date,
        default: null,
      },
      approvedByResident: {
        type: Boolean,
        default: false,
      },
      completedByProvider: {
        type: Boolean,
        default: false,
      },
    },

    /* ---------------- PRICING (After Inspection) ---------------- */
    finalPrice: {
      laborCost: {
        type: Number,
        default: 0,
      },
      materialCost: {
        type: Number,
        default: 0,
      },
      materialDescription: {
        type: String,
        default: "",
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
      approvedByResident: {
        type: Boolean,
        default: false,
      },
      sentAt: Date,
      approvedAt: Date,
    },

    /* ---------------- OTP VERIFICATION ---------------- */
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

    /* ---------------- STATUS ---------------- */
    status: {
      type: String,
      enum: [
        "posted",                    // Resident posted job
        "offers_received",           // Has offers
        "provider_selected",         // Offer accepted
        "inspection_pending",        // Waiting for inspection approval
        "inspection_scheduled",      // Resident approved inspection
        "inspection_done",           // Provider completed inspection
        "awaiting_price_approval",   // Final price sent, waiting approval
        "price_approved",            // Resident approved final price
        "work_in_progress",          // Work started
        "completed",                 // Work done, paid
        "cancelled",                 // Cancelled
      ],
      default: "posted",
    },

    /* ---------------- TIMESTAMPS ---------------- */
    providerSelectedAt: Date,
    inspectionCompletedAt: Date,
    priceApprovedAt: Date,
    workStartedAt: Date,
    workCompletedAt: Date,

    /* ---------------- PAYMENT ---------------- */
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paidAt: Date,

    /* ---------------- COMMISSION ---------------- */
    commission: {
      rate: {
        type: Number,
        default: 0.15, // 15%
      },
      amount: {
        type: Number,
        default: 0,
      },
      deducted: {
        type: Boolean,
        default: false,
      },
    },

    providerEarning: {
      type: Number,
      default: 0,
    },

    /* ---------------- CANCELLATION ---------------- */
    cancelledBy: {
      type: String,
      enum: ["resident", "provider", null],
      default: null,
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    cancellationFee: {
      type: Number,
      default: 0,
    },

    /* ---------------- REVIEW ---------------- */
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Generate Booking ID
bookingSchema.pre("save", function () {
  if (!this.bookingId) {
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    this.bookingId = `BK${date}${random}`;
  }
});

bookingSchema.index({ status: 1, category: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;