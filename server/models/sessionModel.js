import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    refreshTokenHash:{
        type:String,
        required:true
    },
    ip:{
        type:String
    },
    userAgent:{
        type:String
    },
    expiresAt:{
        type:Date,
        required:true,
        index:true
    },
    revokedAt:{
        type:Date,
        default:null
    },
    replacedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Session",
        default:null
    }
},{timestamps:true})

const Session = mongoose.model('Session',sessionSchema)
export default Session