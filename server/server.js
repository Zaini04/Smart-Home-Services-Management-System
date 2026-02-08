import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDb from './configs/DBConnection.js'
import userRouter from './routes/authRoutes.js'
import serviceProviderRouter from './routes/serviceProviderRoutes.js'
import residentRouter from './routes/residentRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import cookieParser from 'cookie-parser'


dotenv.config()
const app = express()

await connectDb()
           
app.use(cors({
    origin: 'http://localhost:5173',
    credentials:true
}))

app.use(cookieParser())
app.use(express.json())
app.use("/uploads", express.static("uploads"));

app.use('/api/user',userRouter)
app.use('/api/serviceProvider',serviceProviderRouter)
app.use('/api/residents',residentRouter)
app.use('/api/admin',adminRouter)



const PORT = process.env.PORT 

app.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`)
})