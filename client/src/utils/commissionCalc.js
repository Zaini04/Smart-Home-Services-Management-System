// utils/commissionCalc.js
export const getCommissionRate = (laborCost) => {
  if (laborCost <= 2000) return 0.10;
  if (laborCost <= 5000) return 0.08;
  if (laborCost <= 10000) return 0.05;
  return 0.025;
};

export const calculateCommission = (laborCost, completedJobs = 0) => {
  const rate = getCommissionRate(laborCost);
  const base = Math.round(laborCost * rate);
  const isNew = completedJobs < 5;
  const final = isNew ? Math.round(base * 0.5) : base;
  return {
    rate,
    ratePercent: `${(rate * 100).toFixed(1)}%`,
    baseCommission: base,
    finalCommission: final,
    isNewProvider: isNew,
    providerKeeps: laborCost - final,
  };
};

export const COMMISSION_TIERS = [
  { range: "0 – 2,000", rate: "10%" },
  { range: "2,001 – 5,000", rate: "8%" },
  { range: "5,001 – 10,000", rate: "5%" },
  { range: "10,001+", rate: "2.5%" },
];

export const MIN_WALLET_BALANCE = 2000;