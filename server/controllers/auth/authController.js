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
import { sendEmail } from "../../utills/sendEmail.js";
import crypto from "crypto";


/* ------------------ SIGNUP ------------------ */
export const signupUser = async (req, res) => {
  try {
    const { full_name, email, phone, password, role, city, address } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      if (!emailExists.isEmailVerified) {
        return errorResponse(res, "Account exists but is unverified. Please login to verify.", 400);
      }
      return errorResponse(res, "Email already taken", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const newUser = await User.create({
      full_name, email, phone, role, city, address,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationOTP: await bcrypt.hash(otp, 10), // Hash OTP for security
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // Valid for 10 mins
    });

    // Send the Email
    const message = `
      <h2>Welcome to Service Hub!</h2>
      <p>Your email verification code is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;
    
try {
  await sendEmail({
    email: newUser.email,
    subject: "Verify your Email",
    message,
  });
} catch (err) {
  console.log("Email failed but user created:", err.message);
}
    // Send response WITHOUT tokens (they are not logged in yet)
    return successResponse(res, "OTP sent to email. Please verify.", { email: newUser.email }, 201);
  } catch (err) {
    return errorResponse(res, "SignUp Failed", 500, err.message);
  }
};


/* ------------------ 2. VERIFY OTP & LOGIN ------------------ */
export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, "User not found", 404);
    if (user.isEmailVerified) return errorResponse(res, "Email already verified", 400);
    
    if (user.otpExpiresAt < new Date()) {
      return errorResponse(res, "OTP has expired. Please request a new one.", 400);
    }

    // Check OTP
    const isMatch = await bcrypt.compare(otp, user.emailVerificationOTP);
    if (!isMatch) return errorResponse(res, "Invalid OTP", 400);

    // Mark as verified
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // NOW generate the Session & Tokens (just like your old signup)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const newSession = await Session.create({
      user: user._id,
      refreshTokenHash: "temp", 
      userAgent: req.get("user-Agent"),
      ip: req.ip,
      expiresAt,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user, newSession._id);

    newSession.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await newSession.save();

    res.cookie(refreshCookieName, refreshToken, refreshCookieOptions);

    return successResponse(res, "Email verified & Logged In successfully", {
      user_id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      accessToken
    }, 200);

  } catch (err) {
    return errorResponse(res, "Verification failed", 500, err.message);
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

    //  if (!user.isEmailVerified) {
    //   // Logic to generate and send a new OTP could go here
    //   return errorResponse(res, "Please verify your email before logging in.", 403);
    // }

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
      kycStatus: user.role === "serviceprovider" ? user.kycStatus : "n/a",
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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, "No user found with that email address.", 404);
    }

    // 1. Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash token and save to DB (Valid for 15 mins)
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; 
    await user.save();

    // 3. Create reset URL (Frontend URL)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // 4. Send Email
    const message = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}" style="background:#2563eb; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block; margin-top:10px;">Reset Password</a>
      <p style="margin-top:20px; font-size:12px; color:gray;">If you didn't request this, please ignore this email. The link expires in 15 minutes.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Service Hub - Password Reset",
        message,
      });

      return successResponse(res, "Password reset link sent to your email.", null, 200);
    } catch (err) {
      // If email fails, clear the tokens so they can try again
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return errorResponse(res, "Failed to send email. Try again later.", 500);
    }
  } catch (err) {
    return errorResponse(res, "Forgot password failed", 500, err.message);
  }
};


/* ------------------ RESET PASSWORD ------------------ */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // 1. Hash the incoming token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Find user with this token AND check if it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, "Token is invalid or has expired", 400);
    }

    // 3. Hash the new password & save
    user.password = await bcrypt.hash(newPassword, 10);
    
    // 4. Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return successResponse(res, "Password has been reset successfully. You can now login.", null, 200);
  } catch (err) {
    return errorResponse(res, "Reset password failed", 500, err.message);
  }
};