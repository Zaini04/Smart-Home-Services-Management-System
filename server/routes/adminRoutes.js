import express from "express";
import { uploadServiceImage } from "../middlewares/serviceUpload.js";
import { protect } from "../middlewares/protect.js";
import { adminOnly } from "../middlewares/adminOnly.js";
import {
  getAllProviders,
  getPendingWorkers,
  updateKycStatus,
} from "../controllers/admin/workersController.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoriesWithSkills,
  updateCategory,
} from "../controllers/admin/categoryController.js";
import {
  createSubCategory,
  deleteSubCategory,
  updateSubCategory,
} from "../controllers/admin/subCategoryController.js";

import {
  getAllBookings,
  getBookingDetails,
} from "../controllers/admin/bookingController.js";
import {
  getPlatformDashboard,
  getPlatformWalletDetails,
  getPlatformTransactions,
  adminWithdraw,
  getEarningsReport,
  getTopProviders,
  viewProviderWallet,
} from "../controllers/admin/platformController.js";
import { getComprehensiveAnalytics } from "../controllers/admin/analyticsController.js";

const adminRouter = express.Router();



// ── Workers ──
adminRouter.get("/getPendingWorkers", getPendingWorkers);
adminRouter.put("/update-KYC/:providerId", updateKycStatus);
adminRouter.get("/getAllWorkers", getAllProviders);

// ── Categories ──
adminRouter.post("/createCategory", createCategory);
adminRouter.get("/categories", getCategories);
adminRouter.put("/category/:categoryId", protect, adminOnly, updateCategory);
adminRouter.delete(
  "/category/:categoryId",
  protect,
  adminOnly,
  deleteCategory
);
adminRouter.get("/getCategoriesWithSkills", getCategoriesWithSkills);

// ── SubCategories ──
adminRouter.post("/subCategory/createSubCategory", createSubCategory);
adminRouter.put(
  "/subCategory/:subCategoryId",
  protect,
  adminOnly,
  updateSubCategory
);
adminRouter.delete(
  "/subCategory/:subCategoryId",
  protect,
  adminOnly,
  deleteSubCategory
);

// ── Bookings ──
adminRouter.get("/bookings", protect, adminOnly, getAllBookings);
adminRouter.get("/bookings/:bookingId", protect, adminOnly, getBookingDetails);

// ══════════════════════════════════════════
//  ★ PLATFORM EARNINGS & WALLET (NEW) ★
// ══════════════════════════════════════════

adminRouter.get("/platform/comprehensive-analytics", protect, getComprehensiveAnalytics);


adminRouter.get(
  "/platform/dashboard",
  protect,
  adminOnly,
  getPlatformDashboard
);

adminRouter.get(
  "/platform/wallet",
  protect,
  adminOnly,
  getPlatformWalletDetails
);

adminRouter.get(
  "/platform/transactions",
  protect,
  adminOnly,
  getPlatformTransactions
);

adminRouter.post(
  "/platform/withdraw",
  protect,
  adminOnly,
  adminWithdraw
);

adminRouter.get(
  "/platform/earnings-report",
  protect,
  adminOnly,
  getEarningsReport
);

adminRouter.get(
  "/platform/top-providers",
  protect,
  adminOnly,
  getTopProviders
);

adminRouter.get(
  "/platform/provider-wallet/:providerId",
  protect,
  adminOnly,
  viewProviderWallet
);

export default adminRouter;