import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SupportTicket from './models/supportTicketModel.js';

dotenv.config();

const checkDb = async () => {
    try {
        await mongoose.connect(`${process.env.MONODB_URI}/SmartHomeServicesManagementSystem`);
        console.log("Connected to DB");
        
        const count = await SupportTicket.countDocuments();
        console.log("Total Support Tickets:", count);
        
        const tickets = await SupportTicket.find().limit(5).sort({ createdAt: -1 });
        console.log("Latest 5 tickets:", JSON.stringify(tickets, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkDb();
