import { currencies } from "@/data/currency";
import { findUserPlayerId } from "@/data/user";
import { db } from "./db";
import { randomBytes, randomInt } from "crypto";
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
export function getSportsUrl(url: string, type?: string | null) {
  if (!url) return url;

  // 1. Create a URL object from the incoming game URL
  const parsed = new URL(url);

  // 2. Default to "live" if type isn't specified or matched
  const page = type === "line" ? "line" : "live";

  // 3. Replace the URL path segments for live/line
  parsed.pathname = parsed.pathname
    .split("/")
    .map((segment) =>
      segment === "live" || segment === "line" ? page : segment,
    )
    .join("/");

  // 4. Replace the external domain with the local Next.js rewrite proxy route
  const targetDomain = "https://sportshub-custom001.network";
  const updatedUrlString = parsed.toString();

  if (updatedUrlString.startsWith(targetDomain)) {
    return updatedUrlString.replace(targetDomain, "/game-proxy");
  }

  return updatedUrlString;
}
