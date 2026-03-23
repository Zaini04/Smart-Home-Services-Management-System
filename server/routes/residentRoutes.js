import express from "express";
import {
  getApprovedProviders,
  getCategories,
} from "../controllers/resident/residentController.js";
import { upload } from "../middlewares/upload.js";
import {  changePassword, getUserProfile, updateUserProfile } from "../controllers/resident/accountController.js";
import { uploadBookingImages } from "../middlewares/bookingUpload.js";
import {
  acceptOffer,
  approveFinalPrice,
  respondToInspection,
  approvePriceRevision,
  approveScheduleUpdate,
  cancelBooking,
  confirmPayment,
  createBooking,
  getBookingDetails,
  getBookingOffers,
  getMyBookings,
  rejectFinalPrice,
  submitReview,
} from "../controllers/resident/bookingController.js";
import { protect } from "../middlewares/protect.js";

const residentRouter = express.Router();

residentRouter.get("/getWorkers", getApprovedProviders);
residentRouter.get("/getCategories", getCategories);

// ── Account & Profile ──
residentRouter.get("/profile", protect, getUserProfile);
residentRouter.put("/profile", protect, upload.single("profileImage"), updateUserProfile);
residentRouter.put("/change-password", protect, changePassword);



// ── Bookings ──
residentRouter.post("/create-booking", protect, uploadBookingImages.array("images", 5), createBooking);
residentRouter.get("/bookings", protect, getMyBookings);
residentRouter.get("/bookings/:bookingId", protect, getBookingDetails);
residentRouter.get("/bookings/:bookingId/offers", protect, getBookingOffers);

residentRouter.post("/bookings/accept-offer/:offerId", protect, acceptOffer);
residentRouter.post("/bookings/:bookingId/respond-inspection", protect, respondToInspection);
residentRouter.post("/bookings/:bookingId/approve-price", protect, approveFinalPrice);
residentRouter.post("/bookings/:bookingId/reject-price", protect, rejectFinalPrice);
residentRouter.post("/bookings/:bookingId/confirm-payment", protect, confirmPayment);
residentRouter.post("/bookings/:bookingId/cancel", protect, cancelBooking);
residentRouter.post("/bookings/:bookingId/review", protect, submitReview);

residentRouter.post("/bookings/:bookingId/approve-revision/:revisionId", protect, approvePriceRevision);
residentRouter.post("/bookings/:bookingId/approve-schedule", protect, approveScheduleUpdate);

export default residentRouter;