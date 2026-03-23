import User from "../../models/userModel.js";
import Booking from "../../models/bookingModel.js";
import ServiceProvider from "../../models/service_providerModel.js";
import PlatformTransaction from "../../models/platformTransactionModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

// Helper function to get exact local YYYY-MM-DD
const getLocalYYYYMMDD = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* ════════════════════════════════════════════
   COMPREHENSIVE ANALYTICS 📊 (Timezone Safe + User Growth)
   ════════════════════════════════════════════ */
export const getComprehensiveAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    /* ── 1. BOOKINGS & STATUS ── */
    const allBookings = await Booking.find();
    let completedCount = 0, cancelledCount = 0, pendingCount = 0;

    allBookings.forEach((b) => {
      if (b.status === "completed") completedCount++;
      else if (b.status === "cancelled") cancelledCount++;
      else pendingCount++;
    });

    const bookingStatusData = [
      { name: "Completed", value: completedCount, color: "#10b981" },
      { name: "Active/Pending", value: pendingCount, color: "#f59e0b" },
      { name: "Cancelled", value: cancelledCount, color: "#ef4444" },
    ];

    /* ── 2. TIMELINE DATA: REVENUE, BOOKINGS, & USER GROWTH ── */
    const [recentTransactions, recentUsers] = await Promise.all([
      PlatformTransaction.find({
        type: { $in: ["commission_received", "penalty_received"] },
        createdAt: { $gte: thirtyDaysAgo },
      }),
      User.find({ createdAt: { $gte: thirtyDaysAgo } }) // Fetch new users for growth chart
    ]);

    const recentBookings = allBookings.filter(b => new Date(b.createdAt) >= thirtyDaysAgo);
    const timelineData = [];
    let total30DayRevenue = 0;

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const targetDateString = getLocalYYYYMMDD(d);

      // Revenue & Bookings
      const dayRev = recentTransactions
        .filter((t) => getLocalYYYYMMDD(t.createdAt) === targetDateString)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const dayBooks = recentBookings.filter((b) => getLocalYYYYMMDD(b.createdAt) === targetDateString).length;

      // User Growth
      const newResidents = recentUsers.filter(u => u.role === "resident" && getLocalYYYYMMDD(u.createdAt) === targetDateString).length;
      const newProviders = recentUsers.filter(u => u.role === "serviceprovider" && getLocalYYYYMMDD(u.createdAt) === targetDateString).length;

      total30DayRevenue += dayRev;

      timelineData.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: dayRev,
        bookings: dayBooks,
        newResidents,
        newProviders
      });
    }

    /* ── 3. TOP PROVIDERS (Using Aggregation) ── */
    const topByJobs = await Booking.aggregate([
      { $match: { status: "completed", selectedProvider: { $ne: null } } },
      {
        $group: {
          _id: "$selectedProvider",
          completedJobs: { $sum: 1 },
          totalEarning: { $sum: "$providerEarning" },
          totalCommission: { $sum: "$commission.amount" },
        },
      },
      { $sort: { completedJobs: -1 } },
      { $limit: 5 },
    ]);

    const populatedTopProviders = await ServiceProvider.populate(topByJobs, {
      path: "_id",
      select: "profileImage rating userId",
      populate: { path: "userId", select: "full_name phone profileImage" },
    });

    const formattedTopProviders = populatedTopProviders.map((item) => ({
      id: item._id?._id,
      name: item._id?.userId?.full_name || "Unknown",
      phone: item._id?.userId?.phone || "N/A",
      image: item._id?.userId?.profileImage || item._id?.profileImage,
      jobs: item.completedJobs,
      totalEarning: item.totalEarning || 0,
      totalCommission: item.totalCommission || 0,
      rating: item._id?.rating || 0
    }));

    /* ── 4. LOW RATED PROVIDERS ── */
    const lowRatedProviders = await ServiceProvider.find({ rating: { $gt: 0, $lte: 3.0 } })
      .populate("userId", "full_name")
      .sort({ rating: 1 })
      .limit(5);

    /* ── 5. INSIGHTS ── */
    const totalUsers = await User.countDocuments({ role: "resident" });
    const userBookingCounts = {};
    allBookings.forEach((b) => {
      const uid = b.resident.toString();
      userBookingCounts[uid] = (userBookingCounts[uid] || 0) + 1;
    });

    const repeatCustomersCount = Object.values(userBookingCounts).filter((count) => count > 1).length;
    const retentionRate = totalUsers > 0 ? ((repeatCustomersCount / totalUsers) * 100).toFixed(1) : "0.0";

    const insights = [];
    if (total30DayRevenue > 0) insights.push(`Platform generated Rs. ${total30DayRevenue.toLocaleString()} in the last 30 days.`);
    if (formattedTopProviders.length > 0) insights.push(`🏆 ${formattedTopProviders[0].name} is your top earner with Rs. ${formattedTopProviders[0].totalEarning.toLocaleString()} generated.`);
    if (parseFloat(retentionRate) > 15) insights.push(`🔥 Great customer loyalty! ${retentionRate}% of users have booked more than once.`);
    
    const cancelRate = allBookings > 0 ? (cancelledCount / allBookings.length) * 100 : 0;
    if (cancelRate > 20) insights.push(`⚠️ High cancellation rate (${cancelRate.toFixed(1)}%). Investigate provider pricing or behavior.`);

    return successResponse(res, "Analytics fetched successfully", {
      summary: {
        totalRevenue: total30DayRevenue,
        totalBookings: allBookings.length,
        repeatCustomers: repeatCustomersCount,
        retentionRate: `${retentionRate}%`,
      },
      charts: {
        timeline: timelineData,
        bookingStatus: bookingStatusData,
      },
      providers: {
        top: formattedTopProviders,
        lowRated: lowRatedProviders.map(p => ({
          id: p._id,
          name: p.userId?.full_name,
          rating: p.rating,
          jobs: p.completedJobs || 0
        }))
      },
      insights
    }, 200);

  } catch (err) {
    return errorResponse(res, "Failed to fetch analytics", 500, err.message);
  }
};