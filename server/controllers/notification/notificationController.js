import Notification from "../../models/notificationModel.js";
import { successResponse, errorResponse } from "../../utills/response.js"; // Adjust path if needed

// Get all notifications for the logged-in user
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Only get the 50 most recent to save memorys

    return successResponse(res, "Notifications fetched", notifications, 200);
  } catch (err) {
    return errorResponse(res, "Failed to fetch notifications", 500, err.message);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    return successResponse(res, "All marked as read", null, 200);
  } catch (err) {
    return errorResponse(res, "Failed to update", 500, err.message);
  }
};