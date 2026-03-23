import express from "express";
import { forgotPassword, loginUser, logoutUser, refreshAccessToken, resetPassword, signupUser, verifyEmailOTP,  } from "../controllers/auth/authController.js";

const userRouter = express.Router();

userRouter.post("/signup", signupUser);
userRouter.post("/login", loginUser);
userRouter.post('/logout',logoutUser)
userRouter.post('/refreshToken',refreshAccessToken)
userRouter.post("/forgot-password", forgotPassword);
userRouter.put("/reset-password/:token", resetPassword);
userRouter.post("/verify-otp", verifyEmailOTP); 


export default userRouter;
