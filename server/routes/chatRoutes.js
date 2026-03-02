// routes/chatRoutes.js
import express from "express";
import { protect } from "../middlewares/protect.js";
import { getChatMessages, getUnreadCount } from "../controllers/chat/chatController.js";
import { getMyConversations } from "../controllers/chat/chatInbox.js";


const chatRouter = express.Router();

chatRouter.get("/unread/count", protect, getUnreadCount);
chatRouter.get("/conversations", protect, getMyConversations);  // ← Add this
chatRouter.get("/:bookingId", protect, getChatMessages);
export default chatRouter;

