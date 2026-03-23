import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    full_name: {
        type:String,
        required:true,   
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    phone:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["admin","resident","serviceprovider"],
        default:"resident",

    },
    profileImage:{
        type:String,
        default:"",
    },
    city:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
     resetPasswordToken: {
    type: String,
    required: false,
  },
  resetPasswordExpires: {
    type: Date,
    required: false,
  },
    isEmailVerified: { type: Boolean, default: false },
  emailVerificationOTP: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },

  // in paise/lowest currency unit or rupees as int
    createdAt: { type: Date, default: Date.now },
},{ timestamps: true })

const User = mongoose.model("User",userSchema)
export default User