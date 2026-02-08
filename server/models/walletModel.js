import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      unique: true,
      required: true,
    },

    balance: {
      type: Number,
      default: 0,
    },

    lockedAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet
