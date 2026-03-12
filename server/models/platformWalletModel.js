// models/platformWalletModel.js
import mongoose from "mongoose";

const platformWalletSchema = new mongoose.Schema(
  {
    // Single document — only one platform wallet exists
    identifier: {
      type: String,
      default: "PLATFORM_WALLET",
      unique: true,
    },

    totalEarnings: {
      type: Number,
      default: 0, // All-time commission earned
    },

    currentBalance: {
      type: Number,
      default: 0, // Available to withdraw
    },

    totalWithdrawn: {
      type: Number,
      default: 0, // Total amount admin has withdrawn
    },
  },
  { timestamps: true }
);

const PlatformWallet = mongoose.model("PlatformWallet", platformWalletSchema);
export default PlatformWallet;