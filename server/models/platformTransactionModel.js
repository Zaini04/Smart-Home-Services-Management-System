// models/platformTransactionModel.js
import mongoose from "mongoose";

const platformTransactionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      default: null,
    },

    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "commission_received",   // Commission from completed job
        "penalty_received",      // Provider cancellation penalty
        "admin_withdrawal",      // Admin withdraws to personal account
        "refund",                // If platform refunds someone
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    // For withdrawals
    withdrawalDetails: {
      method: {
        type: String,
        enum: ["jazzcash", "easypaisa", "bank", "test"],
      },
      accountNumber: String,
      accountName: String,
      processedAt: Date,
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "completed",
      },
    },

    // Who performed the action
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

platformTransactionSchema.index({ type: 1, createdAt: -1 });
platformTransactionSchema.index({ provider: 1 });
platformTransactionSchema.index({ booking: 1 });

const PlatformTransaction = mongoose.model(
  "PlatformTransaction",
  platformTransactionSchema
);
export default PlatformTransaction;