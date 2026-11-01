import { NextRequest, NextResponse } from "next/server";
import { settleDeposit, settleWithdraw } from "../common/settle";
import {
  PK_DEPOSIT_PREFIX,
  PK_WITHDRAW_PREFIX,
  pkConfig,
  verifyParams,
} from "./client";

/**
 * PK gateway callbacks (POST, JSON). The gateway retries until it reads the
 * exact text "success", so every already-handled or irrelevant callback is
 * answered "success"; only invalid signature / unknown order are errors.
 * Money movement is in common/settle.ts (idempotent).
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
  if (!c.secretKey || !verifyParams(payload, c.secretKey)) {
    return { error: reject("Invalid Signature", 400) };
  }
  if (String(payload.merchant_id ?? "") !== c.merchantId) {
    return { error: reject("Unknown merchant", 400) };
  }
  // String(): a crafted object can never reach the Prisma filter as an operator
  const outTradeNo = String(payload.out_trade_no ?? "");
  if (!outTradeNo.startsWith(prefix)) {
    return { error: reject("Required input missing", 400) };
  }
  return { payload: payload as Record<string, unknown>, outTradeNo };
}

const positive = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/* ------------- pay-in: 3 success, 4 failed, 5 expired, 0/1/2 in progress ------------- */
export async function handlePkPayin(req: NextRequest) {
  try {
    const r = await readVerified(req, PK_DEPOSIT_PREFIX);
    if (r.error) return r.error;

    const status = Number(r.payload.status);
    if (status !== 3 && status !== 4 && status !== 5) return ack(); // in progress

    const paid =
      positive(r.payload.actual_amount) ?? positive(r.payload.order_amount);
    const result = await settleDeposit(
      r.outTradeNo,
      status === 3 ? "success" : "failed",
      paid,
    );
    if (result === "not_found") return reject("Deposit not found", 404);
    return ack();
  } catch (error) {
    console.error("[pk-pay payin callback]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/* ------------- payout: 2 success, 3/4/5 failed, -1/0/1 in progress ------------- */
export async function handlePkPayout(req: NextRequest) {
  try {
    const r = await readVerified(req, PK_WITHDRAW_PREFIX);
    if (r.error) return r.error;

    const status = Number(r.payload.status);
    if (status !== 2 && status !== 3 && status !== 4 && status !== 5) {
      return ack(); // review / pending / processing
    }

    const result = await settleWithdraw(
      r.outTradeNo,
      status === 2 ? "success" : "failed",
    );
    if (result === "not_found") return reject("Withdrawal not found", 404);
    return ack();
  } catch (error) {
    console.error("[pk-pay payout callback]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
