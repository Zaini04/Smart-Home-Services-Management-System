import express from "express";
import { upload } from "../middlewares/upload.js";
import {
  completeProviderProfile,
  getCategoriesWithSkills,
  getProviderProfile,
  getProviderStatus,
  updateProviderProfile,
} from "../controllers/serviceProvider/profileController.js";
import { protect } from "../middlewares/protect.js";
import {
  completeInspection,
  completeWork,
  getAvailableBookings,
  getDashboard,
  getJobDetails,
  getMyJobs,
  getMyOffers,
  providerCancelJob,
  requestInspection,
  respondToCounterFee,
  sendFinalPrice,
  sendOrUpdateOffer,
  startWork,
  updatePendingSchedule,
  updatePriceDuringWork,
  updateSchedule,
  verifyStartOTP,
} from "../controllers/serviceProvider/bookingController.js";
import {
  getWallet,
  topUpWallet,
  withdrawFromWallet,
  getTransactions,
} from "../controllers/serviceProvider/walletController.js";

const serviceProviderRouter = express.Router();

const uploadFields = upload.fields([
  { name: "cnicFront", maxCount: 1 },
  { name: "cnicBack", maxCount: 1 },
  { name: "profileImage", maxCount: 1 },
]);

// ── Profile ──
serviceProviderRouter.post("/completeProfile", uploadFields, completeProviderProfile);
serviceProviderRouter.get("/getCategoriesWithSkills", getCategoriesWithSkills);
serviceProviderRouter.get("/status/:userId", getProviderStatus);
serviceProviderRouter.get("/profile/:userId", getProviderProfile);
serviceProviderRouter.put("/profile/:userId", uploadFields, updateProviderProfile);

// ── Dashboard ──
serviceProviderRouter.get("/dashboard", protect, getDashboard);

// ── Wallet ──
serviceProviderRouter.get("/wallet", protect, getWallet);
serviceProviderRouter.post("/wallet/topup", protect, topUpWallet);
serviceProviderRouter.post("/wallet/withdraw", protect, withdrawFromWallet);
serviceProviderRouter.get("/wallet/transactions", protect, getTransactions);

// ── Bookings ──
serviceProviderRouter.get("/available-jobs", protect, getAvailableBookings);
serviceProviderRouter.get("/my-jobs", protect, getMyJobs);
serviceProviderRouter.get("/my-offers", protect, getMyOffers);
serviceProviderRouter.get("/job/:bookingId", protect, getJobDetails);

serviceProviderRouter.post("/offer/:bookingId", protect, sendOrUpdateOffer);
serviceProviderRouter.post("/verify-otp/:bookingId", protect, verifyStartOTP);
serviceProviderRouter.post("/complete-inspection/:bookingId", protect, completeInspection);
serviceProviderRouter.post("/send-price/:bookingId", protect, sendFinalPrice);
serviceProviderRouter.post("/start-work/:bookingId", protect, startWork);
serviceProviderRouter.post("/complete-work/:bookingId", protect, completeWork);

serviceProviderRouter.post("/request-inspection/:bookingId", protect, requestInspection);
serviceProviderRouter.post("/respond-counter-fee/:bookingId", protect, respondToCounterFee);
serviceProviderRouter.post("/update-price/:bookingId", protect, updatePriceDuringWork);
serviceProviderRouter.post("/update-schedule/:bookingId", protect, updateSchedule);
serviceProviderRouter.post("/cancel-job/:bookingId", protect, providerCancelJob);
serviceProviderRouter.put(
  "/booking/:bookingId/update-pending-schedule",
  protect,
  updatePendingSchedule
);
// serviceProviderRouter.post("/booking/:bookingId/request-reschedule", protect, requestReschedule);


export default serviceProviderRouter;