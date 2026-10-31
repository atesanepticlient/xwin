import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { COUNTRIES } from "@/lib/location-data";
import { getClientIp } from "./http";
import type { CountryCode } from "./types";

/**
 * Country <-> currency lookup.
 * Source of truth is the PaymentCountry table. If the table is empty (not
 * seeded yet) or the query fails, the static COUNTRIES list is used, so the
 * system keeps working before the migration/seed is run.
 */
export interface CountryInfo {
  code: CountryCode;
  name: string;
  currencyCode: string;
}

const TTL_MS = 5 * 60 * 1000;
let cache: { rows: CountryInfo[]; expiresAt: number } | null = null;

export async function getPaymentCountries(): Promise<CountryInfo[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.rows;

  let rows: CountryInfo[] = [];
  try {
    rows = await db.paymentCountry.findMany({
      where: { isActive: true },
      select: { code: true, name: true, currencyCode: true },
    });
  } catch (error) {
    console.error("[payment] PaymentCountry lookup failed, using fallback", error);
  }

  if (rows.length === 0) {
    rows = COUNTRIES.map((c) => ({
      code: c.code,
      name: c.name,
      currencyCode: c.currency,
    }));
  }

  cache = { rows, expiresAt: Date.now() + TTL_MS };
  return rows;
}

export async function countryFromCurrency(
  currency: string,
): Promise<CountryCode | null> {
  const cur = currency.toUpperCase();
  const rows = await getPaymentCountries();
  return rows.find((r) => r.currencyCode.toUpperCase() === cur)?.code ?? null;
}

export async function currencyFromCountry(
  code: CountryCode,
): Promise<string | null> {
  const rows = await getPaymentCountries();
  return rows.find((r) => r.code === code.toUpperCase())?.currencyCode ?? null;
}

/* ---------------- IP based detection (fallback only) ---------------- */

const IP_TTL_MS = 10 * 60 * 1000;
const ipCache = new Map<string, { country: CountryCode | null; expiresAt: number }>();

export async function detectCountryFromIp(
  req: NextRequest,
): Promise<CountryCode | null> {
  // Edge/CDN headers first: free and instant.
  const header =
    req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry");
  if (header && /^[A-Za-z]{2}$/.test(header)) return header.toUpperCase();

  const ip = getClientIp(req);
  const hit = ipCache.get(ip);
  if (hit && hit.expiresAt > Date.now()) return hit.country;

  let country: CountryCode | null = null;
  try {
    const res = await fetch(`https://ipwho.is/${ip}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      const code = String(data?.country_code ?? "").toUpperCase();
      country = /^[A-Z]{2}$/.test(code) ? code : null;
    }
  } catch (error) {
    console.error("[payment] IP country lookup failed", error);
  }

  ipCache.set(ip, { country, expiresAt: Date.now() + IP_TTL_MS });
  return country;
}

/* ---------------- the one function the routes use ---------------- */

export interface ResolvedCountry {
  country: CountryCode | null;
  currency: string | null;
  source: "currency" | "ip" | "none";
}

/**
 * 1. Account currency (wallet.currencyCode) -> country. This is authoritative:
 *    the balance is held in that currency, and an IP can be spoofed with a VPN.
 * 2. IP country, used only when the account has no wallet currency at all.
 * A currency that is not mapped to a country (e.g. USD) resolves to null, it
 * does NOT fall through to IP, so such accounts only get crypto.
 */
export async function resolvePaymentCountry(
  user: { wallet?: { currencyCode?: string | null } | null },
  req: NextRequest,
): Promise<ResolvedCountry> {
  const walletCurrency = user.wallet?.currencyCode?.toUpperCase() ?? null;

  if (walletCurrency) {
    const country = await countryFromCurrency(walletCurrency);
    return { country, currency: walletCurrency, source: "currency" };
  }

  const ipCountry = await detectCountryFromIp(req);
  if (ipCountry) {
    const currency = await currencyFromCountry(ipCountry);
    if (currency) return { country: ipCountry, currency, source: "ip" };
  }
  return { country: null, currency: null, source: "none" };
}
