// controllers/chat/chatController.js

import ChatMessage from "../../models/chatModel.js";
import Booking from "../../models/bookingModel.js";
import ServiceProvider from "../../models/service_providerModel.js";

/* GET /api/chat/conversations — Get all chat conversations for user */
export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Check if user is a provider
    const provider = await ServiceProvider.findOne({ userId });
    
    // Find all bookings where user is involved (as resident or provider)
    // and chat is allowed (after offer accepted)
    const chatAllowedStatuses = [
      "inspection_pending",
      "inspection_scheduled",
      "awaiting_price_approval",
      "price_approved",
      "work_in_progress",
      "completed",
    ];

    let bookings;
    
    if (provider) {
      // User is a provider - get jobs assigned to them
      bookings = await Booking.find({
        selectedProvider: provider._id,
        status: { $in: chatAllowedStatuses },
      })
        .populate("resident", "name email")
        .populate("category", "name")
        .sort({ updatedAt: -1 });
    } else {
      // User is a resident - get their bookings with assigned providers
      bookings = await Booking.find({
        resident: userId,
        selectedProvider: { $ne: null },
        status: { $in: chatAllowedStatuses },
      })
        .populate({
          path: "selectedProvider",
          select: "profileImage userId",
          populate: { path: "userId", select: "name" },
        })
        .populate("category", "name")
        .sort({ updatedAt: -1 });
    }

    // Get last message and unread count for each conversation
    const conversations = await Promise.all(
      bookings.map(async (booking) => {
        // Get last message
        const lastMessage = await ChatMessage.findOne({ bookingId: booking._id })
          .sort({ createdAt: -1 })
          .limit(1);

        // Get unread count (messages sent by other person, not read)
        const unreadCount = await ChatMessage.countDocuments({
          bookingId: booking._id,
          senderId: { $ne: userId },
          isRead: false,
        });

        // Determine the "other person" info
        let otherPerson;
        if (provider) {
          // I'm the provider, other person is resident
          otherPerson = {
            name: booking.resident?.name || "Resident",
            image: null, // Residents don't have profile images in your model
            role: "resident",
          };
        } else {
          // I'm the resident, other person is provider
          otherPerson = {
            name: booking.selectedProvider?.userId?.name || "Worker",
            image: booking.selectedProvider?.profileImage || null,
            role: "provider",
          };
        }

        return {
          bookingId: booking._id,
          bookingDisplayId: booking.bookingId,
          category: booking.category?.name || "Service",
          description: booking.description?.slice(0, 50) + "...",
          status: booking.status,
          otherPerson,
          lastMessage: lastMessage
            ? {
                text: lastMessage.message || (lastMessage.messageType === "image" ? "📷 Image" : ""),
                time: lastMessage.createdAt,
                isFromMe: lastMessage.senderId.toString() === userId.toString(),
              }
            : null,
          unreadCount,
          updatedAt: lastMessage?.createdAt || booking.updatedAt,
        };
      })
    );

    // Sort by last message time (most recent first)
    conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.status(200).json({ success: true, data: conversations });
  } catch (err) {
    console.error("getMyConversations error:", err);
    return res.status(500).json({ message: err.message });
  }
};