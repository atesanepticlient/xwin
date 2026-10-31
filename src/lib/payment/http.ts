import { NextRequest, NextResponse } from "next/server";

export const fail = (
  error: string,
  status = 400,
  extra: Record<string, unknown> = {},
) => NextResponse.json({ error, ...extra }, { status });

export const ok = (body: Record<string, unknown>) =>
  NextResponse.json(body, { status: 200 });

export const getClientIp = (req: NextRequest): string => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
};

export const asString = (v: unknown): string =>
  typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";

/** Positive finite number or null. */
export const asAmount = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
