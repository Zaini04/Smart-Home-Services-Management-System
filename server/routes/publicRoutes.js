import express from "express";
import { getPublicSlides, submitSupportTicket } from "../controllers/public/publicController.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const router = express.Router();

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id || decoded._id).select("-password -api_token");
    }
  } catch (error) {
    // Ignore verification errors for optional auth
  }
  next();
};

router.get("/slider", getPublicSlides);
router.post("/support", optionalAuth, submitSupportTicket);

export default router;
