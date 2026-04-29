import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

console.log("📧 Email User:", process.env.EMAIL_USER ? "Loaded" : "Missing");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (NOT your Gmail login password)
  },
});

export const sendEmail = async ({ email, subject, message }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Service Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: message,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    throw error;
  }
};