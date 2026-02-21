import express from "express";
import { upload } from "../middlewares/upload.js";
import { completeProviderProfile, getCategoriesWithSkills, getProviderProfile, getProviderStatus, updateProviderProfile } from "../controllers/serviceProvider/profileController.js";
import { protect } from "../middlewares/protect.js";
import { completeInspection, completeWork, getAvailableBookings, getDashboard, getJobDetails, getMyJobs, getMyOffers, sendFinalPrice, sendOrUpdateOffer, startWork, verifyStartOTP } from "../controllers/serviceProvider/bookingController.js";

const serviceProviderRouter = express.Router();


const uploadFields = upload.fields([
  { name: "cnicFront", maxCount: 1 },
  { name: "cnicBack", maxCount: 1 },
  { name: "profileImage", maxCount: 1 }
]);
serviceProviderRouter.post("/completeProfile",uploadFields,completeProviderProfile);
serviceProviderRouter.get('/getCategoriesWithSkills',getCategoriesWithSkills)


serviceProviderRouter.get("/status/:userId", getProviderStatus);
serviceProviderRouter.get("/profile/:userId", getProviderProfile);
serviceProviderRouter.put("/profile/:userId", uploadFields, updateProviderProfile);

// booking routes

serviceProviderRouter.get("/dashboard", protect, getDashboard);
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
export default serviceProviderRouter;