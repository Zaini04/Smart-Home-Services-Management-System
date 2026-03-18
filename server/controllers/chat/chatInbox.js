import ChatMessage from "../../models/chatModel.js";
import Booking from "../../models/bookingModel.js";
import ServiceProvider from "../../models/service_providerModel.js";

/* GET /api/chat/conversations — Get all chat conversations for user */
export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const provider = await ServiceProvider.findOne({ userId });
    
    // 🌟 FIX: Updated to match your EXACT bookingModel statuses
    const chatAllowedStatuses = [
      "provider_selected",
      "inspection_requested",
      "inspection_approved",
      "awaiting_price_approval",
      "price_approved",
      "work_in_progress",
      "completed",
    ];

    let bookings;
    
    if (provider) {
      bookings = await Booking.find({
        selectedProvider: provider._id,
        status: { $in: chatAllowedStatuses },
      })
        // 🌟 FIX: Use full_name instead of name
        .populate("resident", "full_name email")
        .populate("category", "name")
        .sort({ updatedAt: -1 });
    } else {
      bookings = await Booking.find({
        resident: userId,
        selectedProvider: { $ne: null },
        status: { $in: chatAllowedStatuses },
      })
        .populate({
          path: "selectedProvider",
          select: "profileImage userId",
          // 🌟 FIX: Use full_name instead of name
          populate: { path: "userId", select: "full_name" }, 
        })
        .populate("category", "name")
        .sort({ updatedAt: -1 });
    }

    const conversations = await Promise.all(
      bookings.map(async (booking) => {
        const lastMessage = await ChatMessage.findOne({ bookingId: booking._id })
          .sort({ createdAt: -1 })
          .limit(1);

        const unreadCount = await ChatMessage.countDocuments({
          bookingId: booking._id,
          senderId: { $ne: userId },
          isRead: false,
        });

        // 🌟 FIX: Format Name nicely: "John Doe (Electrical)"
        let otherPerson;
        const categoryName = booking.category?.name || "Service";

        if (provider) {
          const resName = booking.resident?.full_name || "Resident";
          otherPerson = {
            name: `${resName} (${categoryName})`,
            image: null, 
            role: "resident",
          };
        } else {
          const provName = booking.selectedProvider?.userId?.full_name || "Worker";
          otherPerson = {
            name: `${provName} (${categoryName})`,
            image: booking.selectedProvider?.profileImage || null,
            role: "provider",
          };
        }

        // Determine correct text for last message preview
        let lastMsgText = "";
        if (lastMessage) {
            if (lastMessage.messageType === "image") lastMsgText = "📷 Image";
            else if (lastMessage.messageType === "video") lastMsgText = "🎥 Video";
            else lastMsgText = lastMessage.message || "Started conversation";
        }

        return {
          bookingId: booking._id,
          bookingDisplayId: booking.bookingId,
          category: categoryName,
          description: booking.description?.slice(0, 50) + "...",
          status: booking.status,
          otherPerson,
          lastMessage: lastMessage
            ? {
                text: lastMsgText,
                time: lastMessage.createdAt,
                isFromMe: lastMessage.senderId.toString() === userId.toString(),
                messageType: lastMessage.messageType
              }
            : null,
          unreadCount,
          updatedAt: lastMessage?.createdAt || booking.updatedAt,
        };
      })
    );

    conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.status(200).json({ success: true, data: conversations });
  } catch (err) {
    console.error("getMyConversations error:", err);
    return res.status(500).json({ message: err.message });
  }
};