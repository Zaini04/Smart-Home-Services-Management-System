

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDb from './configs/DBConnection.js'
import userRouter from './routes/authRoutes.js'
import serviceProviderRouter from './routes/serviceProviderRoutes.js'
import residentRouter from './routes/residentRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import cookieParser from 'cookie-parser'
import http from "http";
import { Server } from "socket.io";
import ChatMessage from "./models/chatModel.js";
// import Booking     from "./models/bookingModel.js";
import jwt from "jsonwebtoken";
import chatRouter from './routes/chatRoutes.js';
import Booking from './models/bookingModel.js';
import notificationRouter from './routes/notificationRoutes.js';
import path from "path";

dotenv.config()
const uploadsDir = path.resolve("uploads");

const app = express()

app.use("/uploads", express.static(uploadsDir));
await connectDb()

// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://localhost:8081',
//   'http://localhost:8082',
//   process.env.FRONTEND_URL || 'http://localhost:5173'
// ];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients and same-origin calls without an Origin header.
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser())
app.use(express.json())

app.use('/api/user', userRouter)
app.use('/api/serviceProvider', serviceProviderRouter)
app.use('/api/residents', residentRouter)
app.use('/api/admin', adminRouter)
app.use('/api/chat', chatRouter)
app.use('/api/notifications', notificationRouter);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

/* ── Socket Auth Middleware ── */
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id || decoded._id;
    socket.userRole = decoded.role;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

/* ── Socket Events ── */
io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  socket.join(socket.userId.toString());

  /* Join a booking chat room */
  socket.on("join_chat", async ({ bookingId }) => {
    try {
      const booking = await Booking.findById(bookingId)
        .populate("selectedProvider");

      if (!booking) return;

      // Verify user belongs to this booking
      const isResident =
        booking.resident.toString() === socket.userId.toString();
      const isProvider =
        booking.selectedProvider?.userId?.toString() === socket.userId.toString();

      if (!isResident && !isProvider) return;

      socket.join(`chat_${bookingId}`);
      console.log(`User ${socket.userId} joined chat_${bookingId}`);
    } catch (err) {
      console.error(err);
    }
  });

  /* Send message */
  socket.on("send_message", async ({ bookingId, message, messageType = "text", fileUrl }) => {
    try {
      const booking = await Booking.findById(bookingId)
        .populate("selectedProvider");

      if (!booking) return;

      const isResident =
        booking.resident.toString() === socket.userId.toString();
      const isProvider =
        booking.selectedProvider?.userId?.toString() === socket.userId.toString();

      if (!isResident && !isProvider) return;

      if (["completed", "cancelled"].includes(booking.status)) {
        return; // Prevent chat on closed/cancelled jobs
      }

      // Save to DB
      const newMsg = await ChatMessage.create({
        bookingId,
        senderId: socket.userId,
        senderRole: isResident ? "resident" : "provider",
        message,
        messageType,
        fileUrl,
      });

      // Broadcast to everyone in this chat room
      io.to(`chat_${bookingId}`).emit("receive_message", {
        _id: newMsg._id,
        bookingId,
        senderId: socket.userId,
        senderRole: isResident ? "resident" : "provider",
        message,
        messageType,
        fileUrl,
        isRead: false,
        createdAt: newMsg.createdAt,
      });

      io.emit("data_updated"); // Notify all clients to refresh data (e.g. last message preview)
      const receiverId = isResident
        ? booking.selectedProvider.userId.toString() // If resident sent it, send toast to Provider
        : booking.resident.toString();               // If provider sent it, send toast to Resident

      io.to(receiverId).emit("notification", {
        title: "💬 New Message",
        message: messageType === "text" ? message : `Sent an ${messageType}`,
      });
    } catch (err) {
      console.error("Send message error:", err);
    }
  });

  /* Typing indicator */
  socket.on("typing", ({ bookingId, isTyping }) => {
    socket.to(`chat_${bookingId}`).emit("user_typing", {
      userId: socket.userId,
      isTyping,
    });
  });

  /* Mark as read */
  socket.on("mark_read", async ({ bookingId }) => {
    await ChatMessage.updateMany(
      { bookingId, senderId: { $ne: socket.userId }, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    socket.to(`chat_${bookingId}`).emit("messages_read", {
      bookingId,
      readBy: socket.userId,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on PORT ${PORT} and bound to 0.0.0.0 for mobile access`);
});