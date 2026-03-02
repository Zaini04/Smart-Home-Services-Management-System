// models/chatModel.js
import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    index: true,           // fast lookup by booking
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderRole: {
    type: String,
    enum: ["resident", "provider"],
    required: true,
  },
  message: {
    type: String,
    trim: true,
  },
  image: {
    type: String,          // file path if they send a photo
  },
  messageType: {
    type: String,
    enum: ["text", "image"],
    default: "text",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
}, { timestamps: true });

export default mongoose.model("ChatMessage", chatMessageSchema);