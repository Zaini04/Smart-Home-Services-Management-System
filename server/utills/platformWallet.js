// utils/platformWallet.js
import PlatformWallet from "../models/platformWalletModel.js";
import PlatformTransaction from "../models/platformTransactionModel.js";

/**
 * Get or create the single platform wallet
 */
export const getPlatformWallet = async () => {
  let wallet = await PlatformWallet.findOne({
    identifier: "PLATFORM_WALLET",
  });

  if (!wallet) {
    wallet = await PlatformWallet.create({
      identifier: "PLATFORM_WALLET",
    });
  }

  return wallet;
};

/**
 * Credit commission to platform wallet
 */
export const creditPlatformCommission = async ({
  amount,
  bookingId,
  providerId,
  description,
}) => {
  const wallet = await getPlatformWallet();

  wallet.totalEarnings += amount;
  wallet.currentBalance += amount;
  await wallet.save();

  const transaction = await PlatformTransaction.create({
    booking: bookingId,
    provider: providerId,
    amount,
    type: "commission_received",
    description,
  });

  return { wallet, transaction };
};

/**
 * Credit penalty to platform wallet
 */
export const creditPlatformPenalty = async ({
  amount,
  bookingId,
  providerId,
  description,
}) => {
  const wallet = await getPlatformWallet();

  wallet.totalEarnings += amount;
  wallet.currentBalance += amount;
  await wallet.save();

  const transaction = await PlatformTransaction.create({
    booking: bookingId,
    provider: providerId,
    amount,
    type: "penalty_received",
    description,
  });

  return { wallet, transaction };
};