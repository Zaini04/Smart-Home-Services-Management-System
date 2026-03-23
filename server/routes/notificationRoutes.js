import express from "express";
import { protect } from "../middlewares/protect.js";
import { getMyNotifications, markAllAsRead } from "../controllers/notification/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", protect, getMyNotifications);
notificationRouter.put("/mark-read", protect, markAllAsRead);

export default notificationRouter;