import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["contact_us", "help_support"],
      default: "contact_us",
    },
    senderRole: {
      type: String,
      enum: ["resident", "serviceprovider", "guest"],
      default: "guest",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Optional: if logged in
      required: false,
    },
    status: {
      type: String,
      enum: ["open", "replied", "closed"],
      default: "open",
    },
    adminReply: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
export default SupportTicket;
