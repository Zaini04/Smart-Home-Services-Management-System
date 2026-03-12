// utils/commission.js

/**
 * Commission Tiers (on LABOR cost only):
 *   0 – 2,000       → 10%
 *   2,001 – 5,000    → 8%
 *   5,001 – 10,000   → 5%
 *   10,001+          → 2.5%
 *
 * First 5 completed jobs → 50% discount on commission
 */

export const MIN_WALLET_BALANCE = 2000;

export const getCommissionRate = (laborCost) => {
  if (laborCost <= 2000) return 0.10;
  if (laborCost <= 5000) return 0.08;
  if (laborCost <= 10000) return 0.05;
  return 0.025;
};

export const calculateCommission = (laborCost, completedJobs = 0) => {
  const rate = getCommissionRate(laborCost);
  const baseCommission = Math.round(laborCost * rate);
  const isNewProvider = completedJobs < 5;
  const finalCommission = isNewProvider
    ? Math.round(baseCommission * 0.5)
    : baseCommission;

  return {
    rate,
    ratePercent: `${(rate * 100).toFixed(1)}%`,
    baseCommission,
    discount: isNewProvider ? 50 : 0,      // 50 = 50%
    finalCommission,
    isNewProvider,
    providerKeeps: laborCost - finalCommission,  // from labor portion
  };
};

/**
 * Cancellation penalty calculator
 * Updated for new inspection statuses
 */
export const calculateCancellationPenalty = (booking, cancelledBy) => {
  const inspectionFee = booking.inspection?.agreedFee || 0;
  const laborCost = booking.finalPrice?.laborCost || 0;
  const inspectionDone = booking.inspection?.completedByProvider;

  /* ── BEFORE inspection completed ── */
  if (!inspectionDone &&
    ["posted", "offers_received", "provider_selected",
      "inspection_requested", "inspection_approved"].includes(booking.status)) {
    return { amount: 0, paidBy: null, reason: "No penalty before inspection" };
  }

  /* ── AFTER inspection, BEFORE work ── */
  if (["awaiting_price_approval", "price_approved"].includes(booking.status)) {
    if (cancelledBy === "resident") {
      return {
        amount: inspectionFee,
        paidBy: "resident",
        reason: `Inspection fee Rs. ${inspectionFee}`,
      };
    }
    // provider cancels after inspection
    return {
      amount: 300,
      paidBy: "provider",
      reason: "Provider penalty after inspection: Rs. 300",
    };
  }

  /* ── DURING work ── */
  if (booking.status === "work_in_progress") {
    if (cancelledBy === "resident") {
      // inspection fee + daily-rate × days worked
      const daysWorked = Math.max(
        1,
        Math.ceil(
          (Date.now() - new Date(booking.workStartedAt).getTime()) / 86400000
        )
      );
      const estDays =
        booking.schedule?.estimatedDuration?.unit === "days"
          ? booking.schedule.estimatedDuration.value
          : 1;
      const dailyRate = Math.round(laborCost / Math.max(1, estDays));
      const workPenalty = dailyRate * daysWorked;
      const totalPenalty = inspectionFee + workPenalty;

      return {
        amount: totalPenalty,
        paidBy: "resident",
        reason: `Inspection fee (${inspectionFee}) + ${daysWorked} day(s) work (${workPenalty})`,
      };
    }
    // provider cancels during work → 60% of labor
    return {
      amount: Math.round(laborCost * 0.6),
      paidBy: "provider",
      reason: "60% of labor estimate penalty",
    };
  }

  return { amount: 0, paidBy: null, reason: "No penalty" };
};