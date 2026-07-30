"use server";

import zod from "zod";
import { db } from "@/lib/db";
import {
  nameChangeSchema,
  passwordChangeSchema,
  phoneNumberChangeSchema,
  emailChangeSchema,
} from "@/schema";
import bcrypt from "bcryptjs";

import { findCurrentUser } from "@/data/user";
import { CURRENT_ICORRECT_PASSOWRD, INTERNAL_SERVER_ERROR, EMAIL_ALREADY_IN_USE } from "@/error";
import { NAME_CHANGED, PASSWORD_CHANGED, PHONE_CHANGED, EMAIL_CHANGED } from "@/success";

export const passageChange = async (
  data: zod.infer<typeof passwordChangeSchema>
) => {
  const { currentPassword, password } = data;

  const user = await findCurrentUser();

  try {
    const currentPasswordIsMatch = await bcrypt.compare(
      currentPassword,
      user!.password
    );

    if (!currentPasswordIsMatch) {
      return { error: CURRENT_ICORRECT_PASSOWRD };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.users.update({
      where: {
        id: user!.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return { success: PASSWORD_CHANGED };
  } catch {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const nameChange = async (data: zod.infer<typeof nameChangeSchema>) => {
  const { firstName, lastName } = data;

  try {
    const user = await findCurrentUser();

    await db.users.update({
      where: {
        id: user!.id,
      },
      data: {
        firstName,
        lastName,
      },
    });

    return { success: NAME_CHANGED };
  } catch {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const phoneChange = async (
  data: zod.infer<typeof phoneNumberChangeSchema>
) => {
  const { password, phone } = data;

  try {
    const user = await findCurrentUser();

    const isPasswordMatch = await bcrypt.compare(password, user!.password);

    if (!isPasswordMatch) {
      return { error: CURRENT_ICORRECT_PASSOWRD };
    }

    await db.users.update({
      where: {
        id: user!.id,
      },
      data: {
        phone,
      },
    });

    return { success: PHONE_CHANGED };
  } catch {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const emailChange = async (
  data: zod.infer<typeof emailChangeSchema>
) => {
  const { password, email } = data;

  try {
    const user = await findCurrentUser();

    const isPasswordMatch = await bcrypt.compare(password, user!.password);

    if (!isPasswordMatch) {
      return { error: CURRENT_ICORRECT_PASSOWRD };
    }

    if (email.toLowerCase() === user!.email.toLowerCase()) {
      return { success: EMAIL_CHANGED };
    }

    const existingUser = await db.users.findUnique({
      where: {
        email,
      },
    });

    if (existingUser && existingUser.id !== user!.id) {
      return { error: EMAIL_ALREADY_IN_USE };
    }

    await db.users.update({
      where: {
        id: user!.id,
      },
      data: {
        email,
      },
    });

    return { success: EMAIL_CHANGED };
  } catch {
    return { error: INTERNAL_SERVER_ERROR };
  }
};