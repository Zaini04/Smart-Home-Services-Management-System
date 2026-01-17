import jwt from 'jsonwebtoken'

export const signAccessToken= (user)=>{
    return jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'15m'})
}

export const sigRefreshToken= (user)=>{
    return jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'14d'})
}

export const refreshCookieName = 'refreshToken'


const isProduction = process.env.NODE_ENV === "production";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 15
};
