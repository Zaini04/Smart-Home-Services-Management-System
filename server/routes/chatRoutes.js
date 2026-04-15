// routes/chatRoutes.js
import express from "express";
import { protect } from "../middlewares/protect.js";
import { getChatMessages, getUnreadCount } from "../controllers/chat/chatController.js";
import { getMyConversations } from "../controllers/chat/chatInbox.js";
import { uploadBookingImages } from "../middlewares/bookingUpload.js";


const chatRouter = express.Router();

chatRouter.get("/unread/count", protect, getUnreadCount);
chatRouter.get("/conversations", protect, getMyConversations);  // ← Add this
chatRouter.get("/:bookingId", protect, getChatMessages);

chatRouter.post("/upload", protect, uploadBookingImages.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  // Return the path so the frontend can send it via socket
  res.status(200).json({
    success: true,
    data: { fileUrl: req.file.path.replace(/\\/g, "/") },
  });
});
export default chatRouter;

