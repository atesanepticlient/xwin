import type { NextRequest } from "next/server";
import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";
import { resolvePaymentCountry } from "./country";
import { fail, getClientIp } from "./http";
import type { CurrentUser, PaymentContext } from "./types";

/**
 * Auth + country resolution + body parsing + one shared try/catch.
 * Every payment route (root and country) goes through this.
 */
export async function withContext(
  req: NextRequest,
  handler: (ctx: PaymentContext) => Promise<Response>,
): Promise<Response> {
  try {
    const user = await findCurrentUser();
    if (!user) return fail("Authentication error!", 401);

    const { country, currency } = await resolvePaymentCountry(user, req);

    let body: Record<string, unknown> = {};
    if (req.method !== "GET") {
      const parsed = await req.json().catch(() => null);
      if (parsed && typeof parsed === "object") body = parsed;
    }

    return await handler({
      req,
      user,
      ip: getClientIp(req),
      country,
      currency,
      body,
    });
  } catch (error) {
    console.error(
      "[payment]",
      error instanceof Error ? error.stack || error.message : error,
    );
    return fail(INTERNAL_SERVER_ERROR, 500);
  }
}

export async function userHasAgent(user: CurrentUser): Promise<boolean> {
  const row = await db.users.findUnique({
    where: { id: user.id },
    select: { agentId: true },
  });
  return Boolean(row?.agentId);
}
