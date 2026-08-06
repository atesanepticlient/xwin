import nodemailer from "nodemailer";

// Generate a 6-digit OTP
export const generateToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create transporter for Google SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g. mail.yourdomain.com
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USERNAME, // your@yourdomain.com
    pass: process.env.SMTP_PASSWORD, // email password
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: email,
      subject: `WinpariBet <${process.env.SMTP_USERNAME}>`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Email Verification</h1>
          <p style="font-size: 16px;">Your verification code is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
            ${token}
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 15 minutes.</p>
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    };

    const res = await transporter.sendMail(mailOptions);
    console.log("Email : ", res);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};
