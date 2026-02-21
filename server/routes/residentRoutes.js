import express from 'express'
import { getActiveServices, getApprovedProviders, getCategories } from '../controllers/resident/residentController.js'
import { uploadBookingImages } from '../middlewares/bookingUpload.js'
import { acceptOffer, approveFinalPrice, approveInspection, cancelBooking, confirmPayment, createBooking, getBookingDetails, getBookingOffers, getMyBookings, rejectFinalPrice, submitReview } from '../controllers/resident/bookingController.js'
import { protect } from '../middlewares/protect.js'

const residentRouter =  express.Router()

residentRouter.get('/getWorkers',getApprovedProviders)
residentRouter.get('/getServices',getActiveServices)
residentRouter.get('/getCategories',getCategories)

// Booking Routes


residentRouter.post("/create-booking",protect, uploadBookingImages.array("images", 5), createBooking);
residentRouter.get("/bookings", protect, getMyBookings);
residentRouter.get("/bookings/:bookingId", protect, getBookingDetails);
residentRouter.get("/bookings/:bookingId/offers", protect, getBookingOffers);
residentRouter.post("/bookings/accept-offer/:offerId", protect, acceptOffer);
residentRouter.post("/bookings/:bookingId/approve-inspection", protect, approveInspection);
residentRouter.post("/bookings/:bookingId/approve-price", protect, approveFinalPrice);
residentRouter.post("/bookings/:bookingId/reject-price", protect, rejectFinalPrice);
residentRouter.post("/bookings/:bookingId/confirm-payment", protect, confirmPayment);
residentRouter.post("/bookings/:bookingId/cancel", protect, cancelBooking);
residentRouter.post("/bookings/:bookingId/review", protect, submitReview);
export default residentRouter