import jwt from 'jsonwebtoken';

export const signAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// FIX: Added sessionId parameter and fixed typo (sig -> sign)
export const signRefreshToken = (user, sessionId) => {
  return jwt.sign(
    { id: user._id, role: user.role, sessionId: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '14d' }
  );
};

export const refreshCookieName = 'refreshToken';

const isProduction = process.env.NODE_ENV === "production";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction, // Make sure this is FALSE if testing on localhost (http)
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 15 // 15 days
};