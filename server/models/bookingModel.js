import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    /* ---------------- BASIC INFO ---------------- */

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

      completedApprovedByResident: {
        type: Boolean,
        default: false,
      },
    },

    /* ---------------- PRICING ---------------- */

    finalLaborCost: {
      type: Number,
      default: 0,
    },

    materialCostNote: {
      type: String,
      default: "",
    },

    /* ---------------- WORK SCHEDULE ---------------- */

    scheduledWorkAt: {
      type: Date,
      default: null,
    },

    /* ---------------- STATUS ---------------- */

    status: {
      type: String,
      enum: [
        "posted",
        "offers_received",
        "provider_selected",
        "inspection_pending",
        "inspection_scheduled",
        "inspection_done",
        "awaiting_final_approval",
        "scheduled",
        "work_in_progress",
        "completed",
        "cancelled",
      ],
      default: "posted",
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

    /* ---------------- COMMISSION ---------------- */

    commissionAmount: {
      type: Number,
      default: 0,
    },

    commissionDeducted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking
