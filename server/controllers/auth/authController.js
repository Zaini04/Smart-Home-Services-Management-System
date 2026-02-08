import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";
import Session from "../../models/sessionModel.js"; // Check spelling of your file (sessionModel vs sesstionModel)
import { errorResponse, successResponse } from "../../utills/response.js";
import {
  refreshCookieName,
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken // Fixed typo here
} from "../../utills/tokens.js";


/* ------------------ SIGNUP ------------------ */
export const signupUser = async (req, res) => {
  try {
    const { full_name, email, phone, password, role, city, address } = req.body;

    if (!full_name || !email || !phone || !password || !role || !city || !address) {
      return errorResponse(res, "Missing required fields", 400);
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return errorResponse(res, "Email already taken", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      full_name,
      email,
      phone,
      password: hashedPassword,
      role,
      city,
      address,
    });

    // 1. Create a Session Placeholder (to get _id)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const newSession = await Session.create({
      user: newUser._id,
      refreshTokenHash: "temp", // Temporary
      userAgent: req.get("user-Agent"),
      ip: req.ip,
      expiresAt,
    });

    // 2. Generate Tokens (Embed Session ID)
    const accessToken = signAccessToken(newUser);
    const refreshToken = signRefreshToken(newUser, newSession._id);

    // 3. Update Session with Hash
    newSession.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await newSession.save();

    res.cookie(refreshCookieName, refreshToken, refreshCookieOptions);

    return successResponse(res, "Account created successfully", {
      user_id: newUser._id,
      full_name: newUser.full_name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      city: newUser.city,
      address: newUser.address,
      accessToken
    }, 201);

  } catch (err) {
    return errorResponse(res, "SignUp Failed...", 500, err.message);
  }
};


/* ------------------ LOGIN ------------------ */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, "Invalid Credentials", 400);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return errorResponse(res, "Invalid Credentials", 400);
    }

    // 1. Create Session Placeholder
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const newSession = await Session.create({
      user: user._id,
      refreshTokenHash: "temp",
      userAgent: req.get("user-Agent"),
      ip: req.ip,
      expiresAt,
    });

    // 2. Generate Tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user, newSession._id);

    // 3. Update Session
    newSession.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await newSession.save();

    res.cookie(refreshCookieName, refreshToken, refreshCookieOptions);

    return successResponse(res, "Login successfully", {
      user_id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      city: user.city,
      address: user.address,
      accessToken
    }, 201);

  } catch (err) {
    return errorResponse(res, "Login failed", 500, err.message);
  }
};


/* ------------------ REFRESH TOKEN ------------------ */
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies[refreshCookieName];

    if (!refreshToken) {
      return errorResponse(res, "Access denied: No token provided", 401);
    }

    // 1. Verify Token & Extract Session ID
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return errorResponse(res, "Invalid or Expired Refresh Token", 403);
    }

    // 2. Find Session directly by ID (Optimized)
    const session = await Session.findById(decoded.sessionId).populate('user');

    if (!session || !session.user) {
      return errorResponse(res, "Session expired, kindly login again", 401);
    }

    // 3. Security: Check Hash
    const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!isMatch) {
      // Token reuse detected? Delete session for security
      await Session.findByIdAndDelete(decoded.sessionId);
      return errorResponse(res, "Invalid Token Detected", 403);
    }

    // 4. Rotate Tokens
    const accessToken = signAccessToken(session.user);
    const newRefreshToken = signRefreshToken(session.user, session._id);

    // 5. Update DB
    session.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
    await session.save();

    res.cookie(refreshCookieName, newRefreshToken, refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "New Access Token",
      accessToken,
    });

  } catch (error) {
    return errorResponse(res, "Failed to generate new tokens", 500, error.message);
  }
};


/* ------------------ LOGOUT ------------------ */
export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies[refreshCookieName];

    // If cookie exists, delete the session from DB
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        
        // Delete only the session associated with this specific device/browser
        if (decoded.sessionId) {
          await Session.findByIdAndDelete(decoded.sessionId);
        }
      } catch (error) {
        // If token is expired or invalid, we just ignore the DB deletion 
        // and proceed to clear cookies below
        console.log("Logout: Token was already invalid or expired");
      }
    }

    // Always clear the cookie
    res.clearCookie(refreshCookieName, refreshCookieOptions);

    return successResponse(res, "Logged Out Successfully", {}, 200);
  } catch (error) {
    return errorResponse(res, "Failed to Logout", 500, error.message);
  }
};