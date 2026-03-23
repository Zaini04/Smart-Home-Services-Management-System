import axiosInstance from './apiInstance';

export const getWorkers = () => {
  return axiosInstance.get('/api/residents/getWorkers');
};

export const getServices = () => {
  return axiosInstance.get('/api/residents/getServices');
};

export const getCategories = () => {
  return axiosInstance.get('/api/residents/getCategories');
};

// Booking routes
export const createBooking = (formData) => {
  return axiosInstance.post('/api/residents/create-booking', formData);
};

export const getMyBookings = (params) => {
  return axiosInstance.get('/api/residents/bookings', { params });
};

export const getBookingDetails = (bookingId) => {
  return axiosInstance.get(`/api/residents/bookings/${bookingId}`);
};

export const getBookingOffers = (bookingId) => {
  return axiosInstance.get(`/api/residents/bookings/${bookingId}/offers`);
};

export const acceptOffer = (offerId) => {
  return axiosInstance.post(`/api/residents/bookings/accept-offer/${offerId}`);
};

export const respondToInspection = (bookingId, data) => {
  return axiosInstance.post(`/api/residents/bookings/${bookingId}/respond-inspection`, data);
};

export const approveFinalPrice = (bookingId) => {
  return axiosInstance.post(`/api/residents/bookings/${bookingId}/approve-price`);
};

export const rejectFinalPrice = (bookingId, data) => {
  return axiosInstance.post(`/api/residents/bookings/${bookingId}/reject-price`, data);
};

export const confirmPayment = (bookingId, data) => {
  return axiosInstance.post(`/api/residents/bookings/${bookingId}/confirm-payment`, data);
};

export const cancelBooking = (bookingId, data) => {
  return axiosInstance.post(`/api/residents/bookings/${bookingId}/cancel`, data);
};

export const submitReview = (bookingId, data) => {
  return axiosInstance.post(`/api/residents/bookings/${bookingId}/review`, data);
};

export const approvePriceRevision = (bookingId, revisionId, data) => {
  return axiosInstance.post(
    `/api/residents/bookings/${bookingId}/approve-revision/${revisionId}`,
    data
  );
};

export const approveScheduleUpdate = (bookingId) => {
  return axiosInstance.post(`/api/residents/bookings/${bookingId}/approve-schedule`);
};
