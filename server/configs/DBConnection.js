import mongoose from "mongoose";

const connectDb = async()=>{
    mongoose.connection.on('connected',()=>console.log("Database Connected"))

    await mongoose.connect(`${process.env.MONODB_URI}/SmartHomeServicesManagementSystem`)
}

export default connectDb