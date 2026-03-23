import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: "" }, // Optional: URL to redirect when clicked
    createdAt: { type: Date, default: Date.now, expires: '30d' }, 

  },
  { timestamps: true },
  
);

export default mongoose.model("Notification", notificationSchema);