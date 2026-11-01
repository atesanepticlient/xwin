import { NextRequest, NextResponse } from "next/server";
import { settleDeposit, settleWithdraw } from "../common/settle";
import {
  BD_DEPOSIT_PREFIX,
  BD_WITHDRAW_PREFIX,
  bdConfig,
  verifyCallback,
} from "./client";

/**
 * BD gateway callbacks: GET {notify url}?parter=&orderid=&opstate=&ovalue=&sign=
 * The gateway wants the exact text "success" (it retries otherwise).
 * Money movement is in common/settle.ts (idempotent).
 *
 * The signature is checked first; nothing touches the database before it.
 */
const text = (body: string, status = 200) =>
  new NextResponse(body, { status, headers: { "Content-Type": "text/plain" } });

const ack = () => text("success");

function readVerified(req: NextRequest, prefix: string) {
  const q: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => {
    q[k] = v;
  });
  // the doc spells it "parter" in the URL and "partner" in the table
  if (!q.parter && q.partner) q.parter = q.partner;

  const c = bdConfig();
  if (!c.secretKey || !verifyCallback(q, c.secretKey)) return null;
  if (q.parter !== c.partner) return null;
  if (!q.orderid || !q.orderid.startsWith(prefix)) return null;
  return q;
}

/* ------------- collection: opstate 1 = paid, 0 = unpaid ------------- */
export async function handleBdPayin(req: NextRequest) {
  try {
    const q = readVerified(req, BD_DEPOSIT_PREFIX);
    if (!q) return text("fail", 400);

    if (q.opstate !== "1") return ack(); // unpaid: nothing to do yet

    // ovalue is the amount actually paid: the doc says to credit that amount
    const result = await settleDeposit(q.orderid, "success", q.ovalue);
    if (result === "not_found") return text("fail", 404);
    return ack();
  } catch (error) {
    console.error("[bd-pay payin callback]", error);
    return text("fail", 500);
  }
}

/* ------------- payout: opstate 1 = completed, 0 = failed ------------- */
export async function handleBdPayout(req: NextRequest) {
  try {
    const q = readVerified(req, BD_WITHDRAW_PREFIX);
    if (!q) return text("fail", 400);

    if (q.opstate !== "1" && q.opstate !== "0") return ack();

    const result = await settleWithdraw(
      q.orderid,
      q.opstate === "1" ? "success" : "failed",
    );
    if (result === "not_found") return text("fail", 404);
    return ack();
  } catch (error) {
    console.error("[bd-pay payout callback]", error);
    return text("fail", 500);
  }
}
