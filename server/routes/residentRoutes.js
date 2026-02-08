import express from 'express'
import { getActiveServices, getApprovedProviders } from '../controllers/resident/residentController.js'
import { uploadBookingImages } from '../middlewares/bookingUpload.js'
import { acceptOffer, approveInspection, cancelBooking, createBooking, getBookingOffers, getMyBookings } from '../controllers/resident/bookingController.js'
import { protect } from '../middlewares/protect.js'

const residentRouter =  express.Router()

residentRouter.get('/getWorkers',getApprovedProviders)
residentRouter.get('/getServices',getActiveServices)

// Booking Routes


residentRouter.post(
  "/create-booking",
  protect,
  createBooking
);

// Upload images AFTER booking exists
residentRouter.post(
  "/:bookingId/images",
  protect,
  uploadBookingImages.array("images", 5),
  (req, res) => {
    const images = req.files.map((f) => f.path);
    res.status(200).json({ success: true, images });
  }
);

residentRouter.get("/mybookings", protect, getMyBookings);
residentRouter.get("/:bookingId/offers", protect, getBookingOffers);
residentRouter.post("/accept-offer/:offerId", protect, acceptOffer);
residentRouter.post("/:bookingId/approve-inspection", protect, approveInspection);
residentRouter.post("/:bookingId/cancel", protect, cancelBooking);
export default residentRouter