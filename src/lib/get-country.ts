import { headers } from "next/headers";
import { COUNTRIES } from "@/lib/location-data";

const FALLBACK_COUNTRY = "BD";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const cache = new Map<string, { country: string; expiresAt: number }>();

async function getClientIp(): Promise<string | undefined> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const forwardedIp = forwarded?.split(",")[0]?.trim();
  const realIp = headersList.get("x-real-ip");
  return forwardedIp ?? realIp ?? undefined;
}

export async function getCountryFromHeaders(): Promise<string> {
  const ip = await getClientIp();
  const cacheKey = ip ?? "unknown";

  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.country;
  }

  try {
    const url = ip ? `https://ipwho.is/${ip}` : "https://ipwho.is/";
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) return FALLBACK_COUNTRY;

    const data = await res.json();
    const detected = (data?.country_code as string | undefined)?.toUpperCase();
    const isSupported = detected && COUNTRIES.some((c) => c.code === detected);
    const result = isSupported ? detected! : FALLBACK_COUNTRY;

    cache.set(cacheKey, {
      country: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return result;
  } catch (error) {
    console.error("Failed to fetch country from IP:", error);
    return FALLBACK_COUNTRY;
  }
}
