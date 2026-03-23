// controllers/admin/platformController.js
import { getPlatformWallet } from "../../utills/platformWallet.js";
import PlatformTransaction from "../../models/platformTransactionModel.js";
import WalletTransaction from "../../models/walletTransactionModel.js";
import Wallet from "../../models/walletModel.js";
import Booking from "../../models/bookingModel.js";
import ServiceProvider from "../../models/service_providerModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";
import User from "../../models/userModel.js";

/* ════════════════════════════════════════════
   DASHBOARD  —  Admin sees everything
   ════════════════════════════════════════════ */
// Add User import at the top of your controller file

/* ════════════════════════════════════════════
   DASHBOARD  —  Admin Real-Time Dashboard
   ════════════════════════════════════════════ */
export const getPlatformDashboard = async (req, res) => {
  try {
    const wallet = await getPlatformWallet();

    console.log("Platform Wallet:", wallet); // Debug log

    /* ── Time-based earnings ── */
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const [todayEarnings, weekEarnings, monthEarnings] = await Promise.all([
      PlatformTransaction.aggregate([
        { $match: { type: { $in: ["commission_received", "penalty_received"] }, createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      PlatformTransaction.aggregate([
        { $match: { type: { $in: ["commission_received", "penalty_received"] }, createdAt: { $gte: weekStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      PlatformTransaction.aggregate([
        { $match: { type: { $in: ["commission_received", "penalty_received"] }, createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    /* ── Stats Counts ── */
    const [
      totalBookings, completedBookings, activeBookings,cancelledBookings,
      totalProviders, approvedProviders, pendingProvidersCount,
      totalUsers, totalResidents
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: { $in: ["work_in_progress", "provider_selected", "posted", "offers_received"] } }),
      Booking.countDocuments({ status: "cancelled" }),
      ServiceProvider.countDocuments(),
      ServiceProvider.countDocuments({ kycStatus: "approved" }),
      ServiceProvider.countDocuments({ kycStatus: { $in: ["pending", "waiting"] } }),
      User.countDocuments(),
      User.countDocuments({ role: "resident" })
    ]);


    /* ── Fetch Quick Lists for Dashboard UI ── */
    // 1. Pending workers (top 5 for quick review)
    const pendingWorkersList = await ServiceProvider.find({ kycStatus: { $in: ["pending", "waiting"] } })
      .populate("userId", "full_name email phone profileImage")
      .limit(5)
      .sort({ createdAt: -1 });

    // 2. Recent Activities (latest 5 bookings)
    const recentActivities = await Booking.find()
      .populate("resident", "full_name profileImage")
      .populate("category", "name")
      .select("bookingId status createdAt finalPrice")
      .limit(5)
      .sort({ createdAt: -1 });


      const commissionFromJobs = await PlatformTransaction.aggregate([
  { $match: { type: "commission_received" } },
  { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
]);

const penaltyIncome = await PlatformTransaction.aggregate([
  { $match: { type: "penalty_received" } },
  { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
]);

    return successResponse(
      res,
      "Platform dashboard fetched",
      {
        wallet: {
          totalEarnings: wallet.totalEarnings,
          currentBalance: wallet.currentBalance,
          totalWithdrawn: wallet.totalWithdrawn,
        },
        earnings: {
          today: todayEarnings[0]?.total || 0,
          thisWeek: weekEarnings[0]?.total || 0,
          thisMonth: monthEarnings[0]?.total || 0,
        },
        users: {
          total: totalUsers,
          residents: totalResidents,
        },
        incomeBreakdown: {
      commissions: {
        total: commissionFromJobs[0]?.total || 0,
        count: commissionFromJobs[0]?.count || 0,
      },
      penalties: {
        total: penaltyIncome[0]?.total || 0,
        count: penaltyIncome[0]?.count || 0,
      },
    },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          active: activeBookings,
          cancelled: cancelledBookings,
        },
        providers: {
          total: totalProviders,
          approved: approvedProviders,
          pending: pendingProvidersCount,
        },
        lists: {
          pendingWorkers: pendingWorkersList,
          recentActivities: recentActivities
        }
      },
      200
    );
  } catch (err) {
    return errorResponse(res, "Failed to fetch dashboard", 500, err.message);
  }
};
/* ════════════════════════════════════════════
   GET PLATFORM WALLET
   ════════════════════════════════════════════ */
export const getPlatformWalletDetails = async (req, res) => {
  try {
    const wallet = await getPlatformWallet();

    return successResponse(
      res,
      "Platform wallet",
      {
        totalEarnings: wallet.totalEarnings,
        currentBalance: wallet.currentBalance,
        totalWithdrawn: wallet.totalWithdrawn,
        availableToWithdraw: wallet.currentBalance,
      },
      200
    );
  } catch (err) {
    return errorResponse(res, "Failed", 500, err.message);
  }
};

/* ════════════════════════════════════════════
   PLATFORM TRANSACTIONS
   ════════════════════════════════════════════ */
export const getPlatformTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (type) query.type = type;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      PlatformTransaction.find(query)
        .populate({
          path: "booking",
          select: "bookingId finalPrice status",
        })
        .populate({
          path: "provider",
          populate: { path: "userId", select: "full_name phone" },
        })
        .populate("performedBy", "full_name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      PlatformTransaction.countDocuments(query),
    ]);

    return successResponse(
      res,
      "Platform transactions",
      {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      200
    );
  } catch (err) {
    return errorResponse(res, "Failed", 500, err.message);
  }
};

/* ════════════════════════════════════════════
   ADMIN WITHDRAW
   ════════════════════════════════════════════ */
export const adminWithdraw = async (req, res) => {
  try {
    const {
      amount,
      method = "test",
      accountNumber = "",
      accountName = "",
    } = req.body;

    if (!amount || amount <= 0)
      return errorResponse(res, "Amount must be greater than 0", 400);

    const wallet = await getPlatformWallet();

    if (wallet.currentBalance < amount) {
      return errorResponse(
        res,
        `Insufficient balance. Available: Rs. ${wallet.currentBalance}`,
        400
      );
    }

    wallet.currentBalance -= Number(amount);
    wallet.totalWithdrawn += Number(amount);
    await wallet.save();

    const transaction = await PlatformTransaction.create({
      amount: Number(amount),
      type: "admin_withdrawal",
      description: `Admin withdrawal of Rs. ${amount} via ${method}`,
      withdrawalDetails: {
        method,
        accountNumber,
        accountName,
        processedAt: new Date(),
        status: "completed", // For testing — auto-complete
      },
      performedBy: req.user._id,
    });

    return successResponse(
      res,
      "Withdrawal successful",
      {
        withdrawn: Number(amount),
        currentBalance: wallet.currentBalance,
        totalWithdrawn: wallet.totalWithdrawn,
        transaction,
      },
      200
    );
  } catch (err) {
    return errorResponse(res, "Withdrawal failed", 500, err.message);
  }
};

/* ════════════════════════════════════════════
   EARNINGS REPORT (by date range)
   ════════════════════════════════════════════ */
export const getEarningsReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    const matchStage = {
      type: { $in: ["commission_received", "penalty_received"] },
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Group format
    let dateFormat;
    if (groupBy === "month") {
      dateFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    } else if (groupBy === "week") {
      dateFormat = { $dateToString: { format: "%Y-W%V", date: "$createdAt" } };
    } else {
      dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const report = await PlatformTransaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: dateFormat,
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Restructure for easy frontend use
    const grouped = {};
    report.forEach((item) => {
      const date = item._id.date;
      if (!grouped[date]) {
        grouped[date] = {
          date,
          commissions: 0,
          penalties: 0,
          total: 0,
          jobCount: 0,
        };
      }
      if (item._id.type === "commission_received") {
        grouped[date].commissions = item.total;
        grouped[date].jobCount = item.count;
      } else {
        grouped[date].penalties = item.total;
      }
      grouped[date].total += item.total;
    });

    return successResponse(
      res,
      "Earnings report",
      {
        report: Object.values(grouped),
        summary: {
          totalEarnings: Object.values(grouped).reduce(
            (s, d) => s + d.total,
            0
          ),
          totalJobs: Object.values(grouped).reduce(
            (s, d) => s + d.jobCount,
            0
          ),
        },
      },
      200
    );
  } catch (err) {
    return errorResponse(res, "Failed to generate report", 500, err.message);
  }
};

/* ════════════════════════════════════════════
   TOP PROVIDERS (by earnings/jobs)
   ════════════════════════════════════════════ */
export const getTopProviders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topByJobs = await Booking.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$selectedProvider",
          completedJobs: { $sum: 1 },
          totalEarning: { $sum: "$providerEarning" },
          totalCommission: { $sum: "$commission.amount" },
        },
      },
      { $sort: { completedJobs: -1 } },
      { $limit: Number(limit) },
    ]);

    // Populate provider details
    const populated = await ServiceProvider.populate(topByJobs, {
      path: "_id",
      select: "profileImage rating userId",
      populate: { path: "userId", select: "full_name phone" },
    });

    const result = populated.map((item) => ({
      provider: item._id,
      completedJobs: item.completedJobs,
      totalEarning: item.totalEarning,
      totalCommission: item.totalCommission,
    }));

    return successResponse(res, "Top providers", result, 200);
  } catch (err) {
    return errorResponse(res, "Failed", 500, err.message);
  }
};

/* ════════════════════════════════════════════
   VIEW PROVIDER WALLET (Admin oversight)
   ════════════════════════════════════════════ */
export const viewProviderWallet = async (req, res) => {
  try {
    const { providerId } = req.params;

    const provider = await ServiceProvider.findById(providerId)
      .populate("userId", "full_name email phone");

    if (!provider)
      return errorResponse(res, "Provider not found", 404);

    const wallet = await Wallet.findOne({ provider: providerId });

    const transactions = await WalletTransaction.find({
      wallet: wallet?._id,
    })
      .populate("booking", "bookingId")
      .sort({ createdAt: -1 })
      .limit(50);

    return successResponse(
      res,
      "Provider wallet details",
      {
        provider: {
          id: provider._id,
          name: provider.userId.full_name,
          phone: provider.userId.phone,
          completedJobs: provider.completedJobs || 0,
          rating: provider.rating,
        },
        wallet: wallet
          ? {
              balance: wallet.balance,
              lockedAmount: wallet.lockedAmount,
              availableBalance: wallet.balance - wallet.lockedAmount,
            }
          : { balance: 0, lockedAmount: 0, availableBalance: 0 },
        recentTransactions: transactions,
      },
      200
    );
  } catch (err) {
    return errorResponse(res, "Failed", 500, err.message);
  }
};