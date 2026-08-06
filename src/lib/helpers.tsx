import { currencies } from "@/data/currency";
import { findUserPlayerId } from "@/data/user";
import { db } from "./db";
import { randomBytes, randomInt } from "crypto";
import { Prisma } from "@prisma/client";
export const playerIdGenerate = async () => {
  let id;
  let hasUser = true;
  while (hasUser) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    id = ((array[0] % 9000000000) + 1000000000).toString();

    const alreadyExist = await findUserPlayerId(id);

    if (!alreadyExist) {
      hasUser = false;
    }
  }

  return id?.toString();
};

export const referIdGenerate = async (length: number = 6) => {
  let result = "";
  let hasUser = true;
  while (hasUser) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }

    const alreadyExist = await db.users.findFirst({
      where: { referId: result },
    });

    if (!alreadyExist) {
      hasUser = false;
    }
  }

  return result;
};

export const countryNameFinder = (currencyCode: string) => {
  const name = currencies.find((c) => c.currency == currencyCode);

  return name?.country;
};

export function chunkIntoPairs<T>(arr: T[]): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) {
    result.push(arr.slice(i, i + 2));
  }
  return result;
}

export const reduceTurnOver = async (amount: number, userId: string) => {
  try {
    await db.bonusWallet.update({
      where: {
        userId: userId,
      },
      data: {
        turnOver: {
          decrement: amount,
        },
      },
    });
  } catch {
    return null;
  }
};

// e.g. "oneclick_9f3a1c2b@guest.local" - never emailed, just a unique key
export const generateGuestEmail = () => {
  return `oneclick_${randomBytes(6).toString("hex")}@guest.local`;
};

// e.g. "+8801XXXXXXXXX" placeholder phone since one-click collects none
export const generateGuestPhone = () => {
  return `+000${randomInt(100000000, 999999999)}`;
};

// A strong-enough random password. Shown to the user exactly once after
// registration so they can log back in (also stored, same as your
// existing casinoPassword pattern, so support can retrieve it).
export const generateGuestPassword = () => {
  return randomBytes(9).toString("base64url"); // 12 chars, url-safe
};

export const generateGuestName = () => {
  const n = randomInt(100000, 999999);
  return { firstName: "Guest", lastName: `${n}` };
};

export function getSportsUrl(url: string, redirect?: string | null) {
  if (!url) return url;

  try {
    const parsed = new URL(url);

    if (redirect) {
      parsed.pathname = redirect.startsWith("/") ? redirect : `/${redirect}`;
    }

    return parsed.toString();
  } catch (err) {
    console.error("Invalid URL passed to getSportsUrl:", err);
    return url;
  }
}
export function calculateBonus(
  amount: number,
  percentage: number | Prisma.Decimal,
  upTo: number | Prisma.Decimal,
): number {
  const percent = Number(percentage);
  const maxBonus = Number(upTo);

  // Calculate bonus
  const bonus = amount * percent;

  // Don't exceed the maximum bonus
  return Math.min(bonus, maxBonus);
}

const currencyLocales: Record<string, string> = {
  BDT: "bn-BD",
  INR: "en-IN",
  PKR: "ur-PK",
};
export const formatAmount = (amount: number, currency: string) => {
  if (!amount || !currency) return 0;
  const code = currency.toUpperCase();

  // Use "en-IN" for South Asian digit grouping (e.g., 1,00,000) or "en-US" for standard thousand grouping (100,000)
  // Both keep numbers in standard English digits (0-9)
  const locale =
    code === "INR" || code === "BDT" || code === "PKR" ? "en-IN" : "en-US";

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
