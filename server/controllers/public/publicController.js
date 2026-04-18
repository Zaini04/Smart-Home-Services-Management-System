import Slider from "../../models/sliderModel.js";
import SupportTicket from "../../models/supportTicketModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

// @route   GET /api/public/slider
// @desc    Get all active slides for the landing page
export const getPublicSlides = async (req, res) => {
  try {
    const slides = await Slider.find().sort({ order: 1, createdAt: -1 });
    return successResponse(res, "Slides retrieved successfully", slides, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @route   POST /api/public/support
// @desc    Submit a contact us / support ticket
export const submitSupportTicket = async (req, res) => {
  try {
    const { name, email, subject, message, source } = req.body;
    
    if (!name || !email || !subject || !message) {
      return errorResponse(res, "All fields are required", 400);
    }

    // Attempt to determine sender role if user is logged in
    let senderRole = "guest";
    let senderId = null;

    if (req.user) {
      senderRole = req.user.role;
      senderId = req.user._id;
    }

    const ticket = await SupportTicket.create({
      name,
      email,
      subject,
      message,
      source: source || "contact_us",
      senderRole,
      senderId,
      status: "open"
    });

    return successResponse(res, "Message sent successfully! We will get back to you shortly.", ticket, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
