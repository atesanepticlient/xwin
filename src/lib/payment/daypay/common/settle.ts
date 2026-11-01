import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { setPayinBonus, setReferBonusToReferer } from "./bonus";

/**
 * The only place that moves money for gateway callbacks (BD and PK).
 * A country's callback verifies the gateway's signature, translates the
 * gateway status into "success" or "failed", then calls one of these.
 *
 * Idempotent: the PENDING -> final switch is one atomic updateMany, so retries
 * and parallel deliveries can never credit or refund twice.
 */
export type SettleResult = "done" | "already_done" | "not_found";

const positive = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** success: ACCEPTED + credit wallet (+ bonuses). failed: REJECTED, no money. */
export async function settleDeposit(
  orderNo: string,
  outcome: "success" | "failed",
  paidAmount?: unknown,
): Promise<SettleResult> {
  // only e-wallet deposits: crypto deposits live in the same table
  const deposit = await db.deposit.findFirst({
    where: { merchantId: orderNo, ewallet: { category: "MOBILE_BANKING" } },
  });
  if (!deposit) return "not_found";
  if (deposit.status !== "PENDING") return "already_done";

  const success = outcome === "success";
  // the gateway's signed paid amount wins, else what the user ordered
  const credit = positive(paidAmount) ?? Number(deposit.amount);

  if (success && credit !== Number(deposit.amount)) {
    console.warn(
      `[settle] credited amount differs from order: order=${deposit.amount} paid=${credit} ref=${orderNo}`,
    );
  }

  const moved = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const claim = await tx.deposit.updateMany({
      where: { id: deposit.id, status: "PENDING" },
      data: success
        ? { status: "ACCEPTED", amount: credit }
        : { status: "REJECTED" },
    });
    if (claim.count === 0) return false; // another delivery already handled it

    if (success) {
      await tx.wallet.update({
        where: { userId: deposit.userId },
        data: { balance: { increment: credit } },
      });
      await setPayinBonus(tx, deposit.userId, credit);
      await setReferBonusToReferer(tx, deposit.userId, credit);
    }
    return true;
  });

  return moved ? "done" : "already_done";
}

/** success: ACCEPTED. failed: REJECTED + refund exactly what we debited. */
export async function settleWithdraw(
  orderNo: string,
  outcome: "success" | "failed",
): Promise<SettleResult> {
  // only e-wallet withdrawals: crypto withdrawals live in the same table
  const withdraw = await db.withdraw.findFirst({
    where: {
      merchantId: orderNo,
      withdrawEWallet: { category: "MOBILE_BANKING" },
    },
  });
  if (!withdraw) return "not_found";
  if (withdraw.status !== "PENDING") return "already_done";

  const success = outcome === "success";

  const moved = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const claim = await tx.withdraw.updateMany({
      where: { id: withdraw.id, status: "PENDING" },
      data: { status: success ? "ACCEPTED" : "REJECTED" },
    });
    if (claim.count === 0) return false;

    if (!success) {
      await tx.wallet.update({
        where: { userId: withdraw.userId },
        data: { balance: { increment: withdraw.amount } },
      });
    }
    return true;
  });

  return moved ? "done" : "already_done";
}
