import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";
import { errorResponse, successResponse } from "../../utills/response.js";
import { refreshCookieName, refreshCookieOptions, signAccessToken, sigRefreshToken } from "../../utills/tokens.js";
import Session from "../../models/sesstionModel.js";



export const signupUser = async (req, res) => {
  try {
    const { full_name, email, phone, password, role, city, address } = req.body;

    if (!full_name || !email || !phone || !password || !role || !city || !address) {
      return errorResponse(res,"Missing required fields",400)
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return errorResponse(res,"Email already taken",400)
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

    // ✅ Generate token on signup
    // const token = jwt.sign(
    //   { id: newUser._id, role: newUser.role },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "7d" }
    // );

    const accessToken = signAccessToken(newUser);
    const refreshToken = sigRefreshToken(newUser);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 14);

      await Session.create({
      user: newUser._id,
      refreshTokenHash,
      userAgent: req.get("user-Agent"),
      ip: req.ip,
      expiresAt,
    });

    res.cookie(refreshCookieName, refreshToken, refreshCookieOptions);

    return successResponse(
        res,"Account created successfully", 
        {
        user_id: newUser._id,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        city: newUser.city,
        address: newUser.address,
        accessToken
      },
        201)


    // res.status(201).json({
    //   message: "Account created successfully",
    //   accessToken,
    //   user: {
    //     user_id: newUser._id,
    //     full_name: newUser.full_name,
    //     email: newUser.email,
    //     phone: newUser.phone,
    //     role: newUser.role,
    //     city: newUser.city,
    //     address: newUser.address,
    //   },
    //   nextStep:
    //     newUser.role === "serviceprovider"
    //       ? "complete-profile"
    //       : "dashboard",
    // });
  } catch (err) {
    return errorResponse(res,"SignUp Failed...", 500, err.message)
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res,"Invalid Credientials",400)
    }

    // const match = await bcrypt.compare(password, user.password);
    // if (!match) {
    //   return errorResponse(res,"Invalid Credientials",400)
    // }

    // const token = jwt.sign(
    //   { id: user._id, role: user.role },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "7d" }
    // );

    const accessToken = signAccessToken(user);
    const refreshToken = sigRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 14);

      await Session.create({
      user: user._id,
      refreshTokenHash,
      userAgent: req.get("user-Agent"),
      ip: req.ip,
      expiresAt,
    });

    res.cookie(refreshCookieName, refreshToken, refreshCookieOptions);

    return successResponse(
        res,"Login successfully", 
        {
        user_id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        address: user.address,
        accessToken
      },
        201)

    // res.json({
    //   message: "Login successful",
    //   token,
    //   user: {
    //     user_id: user._id,
    //     full_name: user.full_name,
    //     email: user.email,
    //     phone: user.phone,
    //     role: user.role,
    //     city: user.city,
    //     address: user.address,
    //   },
    // });
  } catch (err) {
    return errorResponse(res, "Login failed", 500, err.message);
  }
};

export const refreshAccessToken = async(req,res) => {
  console.log("hi")
  try {
    const refreshToken =  req.cookies[refreshCookieName]
    console.log("previos",refreshToken)

    if(!refreshToken){
      return errorResponse(res,"Access denied",401)
    }

    const sessions = await Session.find({}).populate('user')
    const session = sessions.find(s=>bcrypt.compareSync(refreshToken,s.refreshTokenHash))

    if(!session || !session.user){
      return errorResponse(res,"Kindly login Again",401)
    }
    const accessToken = signAccessToken(session.user)
    const newRefreshToken = sigRefreshToken(session.user)
    session.refreshTokenHash = await bcrypt.hash(newRefreshToken,10)
    session.expiresAt =new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
    await session.save()

    console.log("new refresh token",newRefreshToken)
    res.cookie(refreshCookieName,newRefreshToken,refreshCookieOptions)
return res.status(200).json({
      success: true,
      message: "new Access Token",
      accessToken, // <-- critical
    });  } catch (error) {
     return errorResponse(res, "Failed to genrate new tokens", 500, error.message);   
  }
};


export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies[refreshCookieName];

    if (!refreshToken) {
      return successResponse(res, "already logout", {}, 200);
    }
    const sessions = await Session.find()
    const session = sessions.find(s=>bcrypt.compareSync(refreshToken,s.refreshTokenHash))

    if(session){
      await Session.findByIdAndDelete(session._id)
    }

    

    res.clearCookie(refreshCookieName, refreshCookieOptions);
    res.clearCookie()

     await Session.findOneAndDelete({
      user:req.user?._id
    });
    return successResponse(res, "Logged Out Successfully", {}, 200);
  } catch (error) {
    return errorResponse(res, "Failed to Logout Try Again", 500, error.message);
  }
};