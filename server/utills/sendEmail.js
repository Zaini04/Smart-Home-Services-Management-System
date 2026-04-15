import dotenv from "dotenv";
dotenv.config(); 


import { Resend } from "resend";




console.log("🔑 Resend API Key:", process.env.RESEND_API_KEY ? "Loaded" : "Missing");
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ email, subject, message }) => {
  try {
    const response = await resend.emails.send({
      from: "Service Hub <onboarding@resend.dev>", 
      to: email,
      subject,
      html: message,
      reply_to: "zainiii3092@gmail.com", //
    });

    console.log("✅ Email sent:", response);
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    throw error;
  }
};