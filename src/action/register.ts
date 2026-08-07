"use server";
import zod, { z } from "zod";
import { db } from "@/lib/db";
import { findUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";
import {
  playerIdGenerate,
  referIdGenerate,
  generateGuestEmail,
  generateGuestPhone,
  generateGuestPassword,
  generateGuestName,
} from "@/lib/helpers";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { SIGNUP_SUCCESS } from "@/success";
import { registerSchema, oneClickSchema } from "@/schema";
import { BonusTypeEnum } from "@/types";
import { sendAdminNotification } from "@/lib/notifications";
import { signIn } from "@/auth";
import { encodeData } from "@/lib/secure-data";

const supportedCurrencis = ["BDT", "INR", "PKR"];
// ---------------------------------------------------------------
// "By e-mail" tab: no OTP - validates the email is free and creates
// the user directly with everything collected across the 3 steps.
// ---------------------------------------------------------------
export const register = async (data: zod.infer<typeof registerSchema>) => {
  try {
    const parsed = registerSchema.parse(data);

    if (!supportedCurrencis.includes(parsed.currencyCode)) {
      return { error: "Invalid currency" };
    }

    const exitingUser = await findUserByEmail(parsed.email);
    if (exitingUser) {
      return { error: "The Email already has an account" };
    }

    const { email, country, currencyCode, password, promo, bonusType } = parsed;
    const user = await createUserAndApplyBonus({
      email,
      // `phone`, `firstName`, `lastName` are still required (non-null)
      // columns in the DB, and this wizard doesn't collect any of them,
      // so we fill in placeholders rather than passing null.
      phone: "",
      firstName: "",
      lastName: "",
      country,
      currencyCode,
      password,
      promo,
      bonusType,
      signupMethod: "EMAIL",
    });

    // Auto-login right after account creation, so the user doesn't have
    // to submit the login form again. Uses playerId as the identifier
    // since it's always populated (unlike email in the one-click flow).

    try {
      await signIn("credentials", {
        email: user.playerId,
        password,
        remember: true,
        redirect: false,
      });
    } catch (signInError) {
      // Don't fail the whole signup if auto-login hiccups - the account
      // was already created successfully, they can just log in manually.
      console.log("Auto-login after registration failed", signInError);
    }

    let bonusOffer: {
      bonusPercentage: number;
      upto: number;
      currency: string;
    } | null = null;
    console.log({ parsed });
    if (parsed.bonusType === "FIRST_PAYIN") {
      const bonusSetting = await db.bonusSetting.findUnique({
        where: { id: "global" },
      });
      const payinBonus = Number(bonusSetting!.firstPayin) * 100 || 100;
      const payinBonusUp = Number(bonusSetting!.firstPayinUpTo) || 1000;

      bonusOffer = {
        bonusPercentage: payinBonus,
        upto: payinBonusUp,
        currency: user.wallet?.currencyCode ?? "USD",
      };
    }

    await sendAdminNotification({
      id: crypto.randomUUID(),
      type: "NEW_USER",
      title: "New user registered",
      description: `Just a new user registered account - player ID = ${user.playerId}`,
      createdAt: new Date().toISOString(),
      link: `/users/explor/${user.id}`,
    });

    return {
      success: SIGNUP_SUCCESS,
      playerId: user.playerId,
      bonusOffer,
    };
  } catch (error) {
    console.log("Registration error ", error);
    return { error: INTERNAL_SERVER_ERROR };
  }
};

// ---------------------------------------------------------------
// "One-click" tab (image 4): no email/password collected from the
// user at all - country, currency, promo, bonus choice only. We mint
// a guest email/phone/password behind the scenes and hand the
// generated password + playerId back so the user can log in later.
// ---------------------------------------------------------------
export const oneClickRegister = async (
  data: zod.infer<typeof oneClickSchema>,
) => {
  try {
    const parsed = oneClickSchema.parse(data);

    const email = "";
    const phone = "";
    const password = generateGuestPassword();
    const { firstName, lastName } = generateGuestName();

    if (!supportedCurrencis.includes(parsed.currencyCode)) {
      return { error: "Invalid currency" };
    }

    const user = await createUserAndApplyBonus({
      email,
      phone,
      firstName,
      lastName,
      country: parsed.country,
      currencyCode: parsed.currencyCode,
      password,
      promo: parsed.promo,
      bonusType: parsed.bonusType,
      signupMethod: "ONE_CLICK",
    });

    // Auto-login right after account creation.
    try {
      await signIn("credentials", {
        email: user.playerId,
        password,
        remember: true,
        redirect: false,
      });
    } catch (signInError) {
      console.log(
        "Auto-login after one-click registration failed",
        signInError,
      );
    }

    let bonusOffer: {
      bonusPercentage: number;
      upto: number;
      currency: string;
    } | null = null;
    console.log({ parsed });
    if (parsed.bonusType === "FIRST_PAYIN") {
      const bonusSetting = await db.bonusSetting.findUnique({
        where: { id: "global" },
      });
      const payinBonus = Number(bonusSetting!.firstPayin) * 100 || 100;
      const payinBonusUp = Number(bonusSetting!.firstPayinUpTo) || 1000;

      bonusOffer = {
        bonusPercentage: payinBonus,
        upto: payinBonusUp,
        currency: user.wallet?.currencyCode ?? "USD",
      };
    }

    await sendAdminNotification({
      id: crypto.randomUUID(),
      type: "NEW_USER",
      title: "New user registered",
      description: `Just a new user registered account - player ID = ${user.playerId}`,
      createdAt: new Date().toISOString(),
      link: `/users/explor/${user.id}`,
    });

    return {
      bonusOffer,
      success: SIGNUP_SUCCESS,
      playerId: user.playerId,
      generatedPassword: password, // show this to the user ONCE, they need it to log in
    };
  } catch (error) {
    console.log("One-click registration error ", error);
    return { error: INTERNAL_SERVER_ERROR };
  }
};

// ---------------------------------------------------------------
// Shared user-creation + referral-bonus logic used by both flows above
// (unchanged from before).
// ---------------------------------------------------------------
async function createUserAndApplyBonus(args: {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  country: string;
  currencyCode: string;
  password: string;
  promo?: string;
  bonusType?: z.infer<typeof BonusTypeEnum>;
  signupMethod: "EMAIL" | "ONE_CLICK";
}) {
  const {
    email,
    phone,
    firstName,
    lastName,
    country,
    currencyCode,
    password,
    promo,
    bonusType,
    signupMethod,
  } = args;

  const hasedPassword = bcrypt.hashSync(password, 10);
  const playerId = await playerIdGenerate();
  const referId = await referIdGenerate(6);

  const newUser = await db.users.create({
    data: {
      email,
      phone,
      firstName,
      lastName,
      country,
      signupMethod,
      password: hasedPassword,
      casinoPassword: password,
      playerId: playerId!,
      referId,

      turnOver: {},
      referral: { create: {} },
      wallet: { create: { balance: 0, currencyCode } },
      bonusWallet: { create: { balance: 0, turnOver: 0, currencyCode } },
      messages: {
        create: {
          title: "Your account was created",
          description:
            "You successfuly created an account on WinpariBet. Now you can make deposit using our Payment System",
        },
      },
    },
    include: { wallet: true },
  });

  const bonusSetting = await db.bonusSetting.findUnique({
    where: { id: "global" },
  });

  if (bonusType == "FIRST_PAYIN") {
    const firstPayinBonusPercentage = bonusSetting?.firstPayin || 0.05;

    await db.payinBonus.create({
      data: {
        user: { connect: { id: newUser.id } },
        percentage: firstPayinBonusPercentage,
        type: "FIRST_PAYIN",
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: false,
      },
    });
  }

  if (promo) {
    const promoUser = await db.users.findFirst({
      where: { referId: promo, wallet: { currencyCode: currencyCode } },
      include: { referral: true },
    });

    if (promoUser) {
      // 1. Link referral relationships
      await db.users.update({
        where: {
          id: newUser.id,
        },
        data: {
          referredBy: {
            connect: {
              id: promoUser.referral!.id,
            },
          },
        },
      });

      // 2. Fetch bonus setting to get default amount if needed
      const bonusSetting = await db.bonusSetting.findFirst();

      // 3. Send message notification
      await db.message.create({
        data: {
          title: "You earned an Invitation Cashback! Check your bonus page.",
          user: { connect: { id: promoUser.id } },
        },
      });

      const referPayingBonusPercentage = bonusSetting?.referPayin;
      // 4. Send bonus for new user
      await db.payinBonus.create({
        data: {
          user: { connect: { id: newUser.id } },
          percentage: referPayingBonusPercentage,
          type: "INVITATION",
          expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: false,
        },
      });
    }
  }

  return newUser;
}
