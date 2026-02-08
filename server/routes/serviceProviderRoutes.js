import express from "express";
import { upload } from "../middlewares/upload.js";
import { completeProviderProfile, getCategoriesWithSkills, getProviderProfile, getProviderStatus, updateProviderProfile } from "../controllers/serviceProvider/profileController.js";
import { protect } from "../middlewares/protect.js";
import { completeInspection, completeWork, getAvailableBookings, sendOrUpdateOffer, startWork } from "../controllers/serviceProvider/bookingController.js";

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

serviceProviderRouter.get("/available", protect, getAvailableBookings);
serviceProviderRouter.post("/offer/:bookingId", protect, sendOrUpdateOffer);
serviceProviderRouter.post("/inspection/:bookingId", protect, completeInspection);
serviceProviderRouter.post("/start/:bookingId", protect, startWork);
serviceProviderRouter.post("/complete/:bookingId", protect, completeWork);

export default serviceProviderRouter;