import Notification from "../models/notificationModel.js";

// A single function to save the notification to the DB AND trigger the popup!
export const sendNotification = async (req, targetUserId, title, message) => {
  try {
    // 1. Save it to the database specifically for the target user
    const newNotif = await Notification.create({
      user: targetUserId,
      title,
      message,
    });

    // 2. Send the Socket popup ONLY to that specific user's personal room!
    req.app.get("io")?.to(targetUserId.toString()).emit("notification", newNotif);
    
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};