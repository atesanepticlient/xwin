import { NextRequest, NextResponse } from "next/server";
import { settleDeposit, settleWithdraw } from "../common/settle";
import {
  PK_DEPOSIT_PREFIX,
  PK_WITHDRAW_PREFIX,
  pkConfig,
  verifyCallback,
} from "./client";

/**
 * Callbacks (POST, JSON). Auth is in the headers (X-Merchant-Code, X-Timestamp,
 * X-Nonce, X-Signature). The gateway retries (max 5) until it reads exactly
 * "success" / "SUCCESS" / "ok" / "OK" as plain text, so every already-handled
 * or irrelevant callback is acked; only bad signature / unknown order error.
 * Money movement is in common/settle.ts (must be idempotent).
 *
 * IMPORTANT: numeric `status` differs between collection and payout
 * (3 = success for collection, 3 = failed for payout). We use `status_code`.
 */
const ack = () =>
  new NextResponse("success", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });

const reject = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

async function readVerified(req: NextRequest, prefix: string) {
  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return { error: reject("Invalid body", 400) };
  }
  const c = pkConfig();
  // verify over ALL received fields, the gateway may add new ones over time
  if (!c.secretKey || !verifyCallback(req.headers, payload, c.secretKey)) {
    return { error: reject("Invalid Signature", 400) };
  }
  if (
    req.headers.get("x-merchant-code") !== c.merchantId ||
    String(payload.mch_code ?? c.merchantId) !== c.merchantId
  ) {
    return { error: reject("Unknown merchant", 400) };
  }

  // String(): a crafted object can never reach the Prisma filter as an operator
  const mchOrderNo = String(payload.mch_order_no ?? "");
  if (!mchOrderNo.startsWith(prefix)) {
    return { error: reject("Required input missing", 400) };
  }
  return { payload: payload as Record<string, unknown>, mchOrderNo };
}

const positive = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/* -------- collection: success / failed final; processing, verifying = in progress -------- */
export async function handlePkPayin(req: NextRequest) {
  try {
    const r = await readVerified(req, PK_DEPOSIT_PREFIX);
    if (r.error) return r.error;

    const code = String(r.payload.status_code ?? "");
    if (code !== "success" && code !== "failed") {
      if (code !== "processing" && code !== "verifying") {
        console.warn(
          "[pk-pay payin] unexpected status",
          r.payload.status,
          code,
        );
      }
      return ack(); // in progress / unknown: never decide ourselves
    }

    // real_amount = what the user actually paid (may differ from amount)
    const paid = positive(r.payload.real_amount) ?? positive(r.payload.amount);
    const result = await settleDeposit(
      r.mchOrderNo,
      code === "success" ? "success" : "failed",
      paid,
    );
    if (result === "not_found") return reject("Deposit not found", 404);
    return ack();
  } catch (error) {
    console.error("[pk-pay payin callback]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/* -------- payout: success / failed final; pending, processing = in progress -------- */
export async function handlePkPayout(req: NextRequest) {
  try {
    const r = await readVerified(req, PK_WITHDRAW_PREFIX);
    if (r.error) return r.error;

    const code = String(r.payload.status_code ?? "");
    if (code !== "success" && code !== "failed") {
      // pending / processing, or "reversed" (not callback-driven, but never
      // auto-refund or re-pay on it) / unknown
      if (code !== "pending" && code !== "processing") {
        console.warn(
          "[pk-pay payout] unexpected status",
          r.payload.status,
          code,
        );
      }
      return ack();
    }

    const result = await settleWithdraw(
      r.mchOrderNo,
      code === "success" ? "success" : "failed",
    );
    if (result === "not_found") return reject("Withdrawal not found", 404);
    return ack();
  } catch (error) {
    console.error("[pk-pay payout callback]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
