"use server";
import zod from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { loginEmailSchema, loginPhoneSchema } from "@/schema";

// NOTE: I don't have your actual next-auth (or session) setup, so this
// assumes a next-auth v5 style `signIn` exported from "@/auth" with a
// Credentials provider that takes `identifier` + `password` and looks the
// user up the same way (email OR playerId). Swap this import/call for
// whatever your real auth entry point is if it's different.
import { signIn } from "@/auth";

// ---------------------------------------------------------------
// "By e-mail" tab: identifier can be an email OR a player ID
// ---------------------------------------------------------------
export const loginByEmail = async (
  data: zod.infer<typeof loginEmailSchema>,
) => {
  try {
    const { identifier, password, remember } = loginEmailSchema.parse(data);

    const user = await db.users.findFirst({
      where: {
        OR: [{ email: identifier }, { playerId: identifier }],
      },
    });

    if (!user) {
      return { error: "No account found with that email or ID" };
    }
    if (user.isBanned) {
      return { error: "This account has been suspended" };
    }

    const passwordsMatch = bcrypt.compareSync(password, user.password);
    if (!passwordsMatch) {
      return { error: "Incorrect password" };
    }
    await signIn("credentials", {
      email: identifier,
      password,
      remember,
      redirect: false,
    });
    return { success: "Logged in successfully" };
  } catch (error) {
    console.log("Login error (email)", error);
    return { error: INTERNAL_SERVER_ERROR };
  }
};

// ---------------------------------------------------------------
// "By phone" tab: dialCode + phone are combined into the same
// "+<dialCode><number>" format you'd store on Users.phone
// ---------------------------------------------------------------
export const loginByPhone = async (
  data: zod.infer<typeof loginPhoneSchema>,
) => {
  try {
    const { dialCode, phone, password, remember } =
      loginPhoneSchema.parse(data);
    const fullPhone = `${dialCode}${phone}`;

    const user = await db.users.findFirst({ where: { phone: fullPhone } });

    if (!user) {
      return { error: "No account found with that phone number" };
    }
    if (user.isBanned) {
      return { error: "This account has been suspended" };
    }

    const passwordsMatch = bcrypt.compareSync(password, user.password);
    if (!passwordsMatch) {
      return { error: "Incorrect password" };
    }

    await signIn("credentials", {
      identifier: user.email,
      password,
      remember,
      redirect: false,
    });

    return { success: "Logged in successfully" };
  } catch (error) {
    console.log("Login error (phone)", error);
    return { error: INTERNAL_SERVER_ERROR };
  }
};
