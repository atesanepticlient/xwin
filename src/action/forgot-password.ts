"use server";
import { db } from "@/lib/db";
import { findUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/mail";
import { INTERNAL_SERVER_ERROR } from "@/error";

export const sendPasswordResetEmail = async (email: string) => {
  const existingUser = await findUserByEmail(email);
  if (!existingUser) {
    return { error: "No account found with this email" };
  }

  try {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // 15 minutes expiry

    await db.verificationToken.upsert({
      where: { email },
      update: { token, expires },
      create: {
        email,
        token,
        expires,
      },
    });

    await sendVerificationEmail(email, token);

    return {
      success: "OTP sent to your Email",
      requiresOtp: true,
      email,
    };
  } catch (error) {
    console.log("OTP sending error ", error);
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const verifyOtpAndResetPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { email: data.email },
    });

    if (!verificationToken) {
      return { error: "OTP not found. Please request a new one." };
    }

    if (verificationToken.token !== data.otp) {
      return { error: "Invalid OTP" };
    }

    if (new Date() > verificationToken.expires) {
      return { error: "OTP has expired. Please request a new one." };
    }

    const hashedPassword = bcrypt.hashSync(data.newPassword, 10);

    const user = await db.users.findFirst({ where: { email: data.email } });
    if (!user) {
      return { error: "User not found" };
    }
    await db.$transaction([
      db.users.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          casinoPassword: data.newPassword,
        },
      }),
      db.verificationToken.delete({ where: { email: data.email } }),
    ]);

    return {
      success:
        "Password reset successfully! You can now login with your new password.",
    };
  } catch (error) {
    console.log("Password reset error ", error);
    return { error: INTERNAL_SERVER_ERROR };
  }
};
