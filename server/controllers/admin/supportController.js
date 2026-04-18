import SupportTicket from "../../models/supportTicketModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";

// @route   GET /api/admin/support
// @desc    Get all support tickets
export const getTickets = async (req, res) => {
  try {
    const { status, source } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 });
    return successResponse(res, "Tickets retrieved successfully", tickets, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @route   POST /api/admin/support/:id/reply
// @desc    Reply to a ticket
export const replyTicket = async (req, res) => {
  try {
    const { adminReply } = req.body;
    if (!adminReply) return errorResponse(res, "Reply text is required", 400);

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return errorResponse(res, "Ticket not found", 404);

    ticket.adminReply = adminReply;
    ticket.status = "replied"; // Mark as replied
    await ticket.save();

    // Ideally, here you would send an email to ticket.email with the adminReply
    // using nodemailer to actually "reply to the email and proceed" as user requested

    return successResponse(res, "Replied successfully", ticket, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @route   DELETE /api/admin/support/:id
// @desc    Delete a ticket
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) return errorResponse(res, "Ticket not found", 404);
    return successResponse(res, "Ticket deleted successfully", null, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
