// controllers/serviceProvider/walletController.js
import Wallet            from "../../models/walletModel.js";
import WalletTransaction from "../../models/walletTransactionModel.js";
import ServiceProvider   from "../../models/service_providerModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

/* helper */
const getOrCreateWallet = async (providerId) => {
  let w = await Wallet.findOne({ provider: providerId });
  if (!w) w = await Wallet.create({ provider: providerId });
  return w;
};

/* ──────── GET WALLET ──────── */
export const getWallet = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return errorResponse(res, "Provider not found", 404);

    const wallet = await getOrCreateWallet(provider._id);

    return successResponse(res, "Wallet details", {
      balance:          wallet.balance,
      lockedAmount:     wallet.lockedAmount,
      availableBalance: wallet.balance - wallet.lockedAmount,
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch wallet", 500, err.message);
  }
};

/* ──────── TOP-UP  (Testing = instant credit) ──────── */
export const topUpWallet = async (req, res) => {
  try {
    const { amount, method = "test" } = req.body;
    if (!amount || amount <= 0)
      return errorResponse(res, "Amount must be greater than 0", 400);

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return errorResponse(res, "Provider not found", 404);

    const wallet = await getOrCreateWallet(provider._id);
    wallet.balance += Number(amount);
    await wallet.save();

    await WalletTransaction.create({
      wallet: wallet._id,
      amount: Number(amount),
      type:   "credit",
      reason: `Top-up via ${method} (Testing Mode)`,
    });

        req.app.get("io")?.to(req.user._id.toString()).emit("notification", {
      title: "💳 Wallet Topped Up",
      message: `Successfully added Rs. ${amount} to your wallet.`,
    });

    return successResponse(res, "Wallet topped up", {
      balance:          wallet.balance,
      lockedAmount:     wallet.lockedAmount,
      availableBalance: wallet.balance - wallet.lockedAmount,
    }, 200);
  } catch (err) {
    return errorResponse(res, "Top-up failed", 500, err.message);
  }
};

/* ──────── WITHDRAW ──────── */
export const withdrawFromWallet = async (req, res) => {
  try {
    const { amount, method = "jazzcash", accountNumber = "" } = req.body;
    if (!amount || amount <= 0)
      return errorResponse(res, "Amount must be greater than 0", 400);

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return errorResponse(res, "Provider not found", 404);

    const wallet = await getOrCreateWallet(provider._id);
    const available = wallet.balance - wallet.lockedAmount;

    if (available < amount)
      return errorResponse(
        res,
        `Insufficient available balance. Available: Rs. ${available}`,
        400
      );

    wallet.balance -= Number(amount);
    await wallet.save();

    await WalletTransaction.create({
      wallet: wallet._id,
      amount: Number(amount),
      type:   "debit",
      reason: `Withdrawal → ${method} ${accountNumber} (Testing Mode)`,
    });

        req.app.get("io")?.to(req.user._id.toString()).emit("notification", {
      title: "💳 Wallet Topped Up",
      message: `Successfully added Rs. ${amount} to your wallet.`,
    });

    return successResponse(res, "Withdrawal successful", {
      withdrawn:        Number(amount),
      balance:          wallet.balance,
      lockedAmount:     wallet.lockedAmount,
      availableBalance: wallet.balance - wallet.lockedAmount,
    }, 200);
  } catch (err) {
    return errorResponse(res, "Withdrawal failed", 500, err.message);
  }
};

/* ──────── TRANSACTION HISTORY ──────── */
export const getTransactions = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return errorResponse(res, "Provider not found", 404);

    const wallet = await getOrCreateWallet(provider._id);

    const { page = 1, limit = 20, type } = req.query;
    const q = { wallet: wallet._id };
    if (type) q.type = type;

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(q)
        .populate("booking", "bookingId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      WalletTransaction.countDocuments(q),
    ]);

    return successResponse(res, "Transactions", {
      transactions,
      pagination: {
        page:  Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    }, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch transactions", 500, err.message);
  }
};