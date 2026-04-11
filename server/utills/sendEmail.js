// import nodemailer from "nodemailer";

// export const sendEmail = async (options) => {
//   // 1. Check if credentials exist in .env
//   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//     console.log("\n⚠️ EMAIL CREDENTIALS MISSING IN .env FILE");
//     console.log(`📧 Simulated Email to: ${options.email}`);
//     console.log(`Subject: ${options.subject}`);
//     console.log(`Message: ${options.message}\n`);
//     return; // Bypass actual sending so the app doesn't crash
//   }

//   // 2. Create a transporter
//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   // 3. Define email options
//   const mailOptions = {
//     from: `"Service Hub" <${process.env.EMAIL_USER}>`,
//     to: options.email,
//     subject: options.subject,
//     html: options.message,
//   };

//   // 4. Send email
//   await transporter.sendMail(mailOptions);
// };

import * as Brevo from "@getbrevo/brevo";

export const sendEmail = async (options) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.log("\n⚠️ BREVO API KEY MISSING");
      console.log(`📧 Simulated Email to: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message: ${options.message}\n`);
      return;
    }

    const apiInstance = new Brevo.TransactionalEmailsApi();

    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = {
      sender: {
        name: "Service Hub",
        email: process.env.BREVO_SENDER_EMAIL, // better use env
      },
      to: [{ email: options.email }],
      subject: options.subject,
      htmlContent: options.message,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("✅ Email sent via Brevo", response.messageId);
  } catch (error) {
    console.error("❌ Brevo Email Error:", error.response?.text || error.message);
    throw error;
  }
};