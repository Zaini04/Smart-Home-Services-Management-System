import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDb from './configs/DBConnection.js'
import userRouter from './routes/authRoutes.js'
import serviceProviderRouter from './routes/serviceProviderRoutes.js'
import residentRouter from './routes/residentRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import cookieParser from 'cookie-parser'
import http       from "http";
import { Server } from "socket.io";
import ChatMessage from "./models/chatModel.js";
// import Booking     from "./models/bookingModel.js";
import jwt         from "jsonwebtoken";
import chatRouter from './routes/chatRoutes.js';
import Booking from './models/bookingModel.js';

dotenv.config()
const app = express()

await connectDb()
           
app.use(cors({
    origin: 'http://localhost:5173',
    credentials:true
}))

app.use(cookieParser())
app.use(express.json())
app.use("/uploads", express.static("uploads"));

app.use('/api/user',userRouter)
app.use('/api/serviceProvider',serviceProviderRouter)
app.use('/api/residents',residentRouter)
app.use('/api/admin',adminRouter)
app.use('/api/chat',chatRouter)


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
        credentials: true, // 🌟 ADD THIS LINE

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
  socket.on("send_message", async ({ bookingId, message, messageType = "text",fileUrl }) => {
    try {
      const booking = await Booking.findById(bookingId)
        .populate("selectedProvider");

      if (!booking) return;

      const isResident =
        booking.resident.toString() === socket.userId.toString();
      const isProvider =
        booking.selectedProvider?.userId?.toString() === socket.userId.toString();

      if (!isResident && !isProvider) return;

      // Save to DB
      const newMsg = await ChatMessage.create({
        bookingId,
        senderId:   socket.userId,
        senderRole: isResident ? "resident" : "provider",
        message,
        messageType,
        fileUrl,
      });

      // Broadcast to everyone in this chat room
      io.to(`chat_${bookingId}`).emit("receive_message", {
        _id:        newMsg._id,
        bookingId,
        senderId:   socket.userId,
        senderRole: isResident ? "resident" : "provider",
        message,
        messageType,
        fileUrl,
        isRead:     false,
        createdAt:  newMsg.createdAt,
      });

      io.emit("data_updated"); // Notify all clients to refresh data (e.g. last message preview)

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

const PORT = process.env.PORT 

server.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`)
})