// controllers/chatController.js
import ChatMessage from "../../models/chatModel.js";
import Booking     from "../../models/bookingModel.js";


/* GET /api/chat/:bookingId — load message history */
export const getChatMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    // Verify user belongs to this booking
    const booking = await Booking.findById(bookingId)
      .populate("selectedProvider");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isResident = booking.resident.toString() === userId.toString();
    const isProvider = booking.selectedProvider?.userId?.toString() === userId.toString();

    if (!isResident && !isProvider) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Only allow chat if offer was accepted
    const chatAllowedStatuses = [
      "inspection_pending",
      "inspection_scheduled", 
      "awaiting_price_approval",
      "price_approved",
      "work_in_progress",
      "completed",
    ];

    if (!chatAllowedStatuses.includes(booking.status)) {
      return res.status(400).json({ 
        message: "Chat not available at this stage" 
      });
    }

    const messages = await ChatMessage.find({ bookingId })
      .sort({ createdAt: 1 })          // oldest first
      .limit(100);

    // Mark messages as read
    await ChatMessage.updateMany(
      { bookingId, senderId: { $ne: userId }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({ success: true, data: messages });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* GET /api/chat/unread-count — badge counts */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await ChatMessage.countDocuments({
      senderId: { $ne: userId },
      isRead: false,
    });

    return res.status(200).json({ success: true, data: { count } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};