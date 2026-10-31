import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  setPayinBonus,
  setReferBonusToReferer,
} from "@/app/api/(payment)/(daypay)/daypay/collection/route";
import { pkConfig, verifyParams } from "./client";

/**
 * Gateway callbacks (POST, JSON). The gateway retries until it reads the
 * exact text "success", so every already-handled or irrelevant callback is
 * answered "success"; only invalid signature / unknown order are errors.
 *
 * Idempotent: the PENDING -> final status switch is a single atomic
 * updateMany. Only the callback that wins it moves money, so retries and
 * parallel deliveries can never credit or refund twice.
 */
const ack = () =>
  new NextResponse("success", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });

const reject = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

async function readVerified(req: NextRequest) {
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
  const outTradeNo = String(payload.out_trade_no ?? "");
  if (!outTradeNo) return { error: reject("Required input missing", 400) };
  return { payload: payload as Record<string, unknown>, outTradeNo };
}

const positive = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/* ------------- pay-in: 3 success, 4 failed, 5 expired, 0/1/2 in progress ------------- */
export async function handlePkPayin(req: NextRequest) {
  try {
    const r = await readVerified(req);
    if (r.error) return r.error;

    const status = Number(r.payload.status);
    const success = status === 3;
    const failed = status === 4 || status === 5;
    if (!success && !failed) return ack(); // still in progress

    const deposit = await db.deposit.findFirst({
      where: { merchantId: r.outTradeNo },
    });
    if (!deposit) return reject("Deposit not found", 404);
    if (deposit.status !== "PENDING") return ack();

    const credit =
      positive(r.payload.actual_amount) ??
      positive(r.payload.order_amount) ??
      Number(deposit.amount);

    await db.$transaction(async (tx) => {
      const claim = await tx.deposit.updateMany({
        where: { id: deposit.id, status: "PENDING" },
        data: success
          ? { status: "ACCEPTED", amount: credit }
          : { status: "REJECTED" },
      });
      if (claim.count === 0) return; // another delivery already handled it

      if (success) {
        await tx.wallet.update({
          where: { userId: deposit.userId },
          data: { balance: { increment: credit } },
        });
        await setPayinBonus(tx, deposit.userId, credit);
        await setReferBonusToReferer(tx, deposit.userId, credit);
      }
    });

    return ack();
  } catch (error) {
    console.error("[pk-pay payin callback]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/* ------------- payout: 2 success, 3/4/5 failed, -1/0/1 in progress ------------- */
export async function handlePkPayout(req: NextRequest) {
  try {
    const r = await readVerified(req);
    if (r.error) return r.error;

    const status = Number(r.payload.status);
    const success = status === 2;
    const failed = status === 3 || status === 4 || status === 5;
    if (!success && !failed) return ack(); // review / pending / processing

    const withdraw = await db.withdraw.findFirst({
      where: { merchantId: r.outTradeNo },
    });
    if (!withdraw) return reject("Withdrawal not found", 404);
    if (withdraw.status !== "PENDING") return ack();

    await db.$transaction(async (tx) => {
      const claim = await tx.withdraw.updateMany({
        where: { id: withdraw.id, status: "PENDING" },
        data: { status: success ? "ACCEPTED" : "REJECTED" },
      });
      if (claim.count === 0) return;

      if (failed) {
        // give back exactly what we debited when the request was made
        await tx.wallet.update({
          where: { userId: withdraw.userId },
          data: { balance: { increment: withdraw.amount } },
        });
      }
    });

    return ack();
  } catch (error) {
    console.error("[pk-pay payout callback]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
