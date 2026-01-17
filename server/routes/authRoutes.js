import express from "express";
import { loginUser, logoutUser, refreshAccessToken, signupUser,  } from "../controllers/authController.js";

const userRouter = express.Router();

userRouter.post("/signup", signupUser);
userRouter.post("/login", loginUser);
userRouter.post('/logout',logoutUser)
userRouter.post('/refreshToken',refreshAccessToken)

export default userRouter;
