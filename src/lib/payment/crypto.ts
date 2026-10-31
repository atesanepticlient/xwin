import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { convertCurrency } from "@/lib/helpers";
import { sendAdminNotification } from "@/lib/notifications";
import { userHasAgent } from "./context";
import { asAmount, asString, fail, ok } from "./http";
import { loadWallet } from "./wallets";
import type { PaymentContext } from "./types";

/**
 * Crypto deposit / withdraw. Same logic as the old /api/crypto/* routes,
 * available in every country (no country check on purpose).
 * Amounts are in USD; withdraw converts to the account currency for the debit.
 */
export async function cryptoDeposit(ctx: PaymentContext): Promise<Response> {
  const { user, body } = ctx;

  const walletId = asString(body.walletId);
  const transactionId = asString(body.transactionId);
  const amount = asAmount(body.amount);

  if (!walletId || !body.amount || !transactionId) {
    return fail("Missing required parameters: walletId, amount, transactionId");
  }
  if (amount === null) return fail("Invalid amount.");

  const wallet = ctx.wallet ?? (await loadWallet("deposit", walletId));
  if (!wallet || !wallet.isActive || wallet.category !== "CRYPTO" || !wallet.crypto) {
    return fail("This deposit method is unavailable.");
  }

  if (amount < wallet.min || amount > wallet.max) {
    return fail(`Amount must be between ${wallet.min} and ${wallet.max}.`);
  }

  // same tx hash cannot be claimed twice
  const existing = await db.deposit.findFirst({
    where: { merchantId: transactionId, ewalletId: walletId },
  });
  if (existing) return fail("This transaction ID has already been submitted.");

  const deposit = await db.deposit.create({
    data: {
      payFrom: `Crypto: ${wallet.crypto.currencyCode} (${wallet.crypto.network})`,
      amount,
      merchantId: transactionId,
      status: "PENDING",
      userId: user.id,
      ewalletId: walletId,
    },
  });

  await sendAdminNotification({
    id: crypto.randomUUID(),
    type: "DEPOSIT",
    title: "New crypto deposit found",
    description: `User : ${user.phone || user.email || user.playerId}, created a deposit request for $${deposit.amount}`,
    createdAt: new Date().toISOString(),
    link: "/account/message",
  });

  return ok({
    message: "Deposit request submitted. It will be reviewed shortly.",
    depositId: deposit.id,
  });
}

export async function cryptoWithdraw(ctx: PaymentContext): Promise<Response> {
  const { user, body } = ctx;

  if (user.isBanned) {
    return fail("Your withdrawal is temporary blocked! Contact support");
  }
  if (!user.wallet?.currencyCode) {
    return fail("Withdrawal is blocked at the moment!");
  }

  const walletId = asString(body.walletId);
  const address = asString(body.address);
  const amount = asAmount(body.amount);

  if (!walletId || !body.amount || !address) {
    return fail("Missing required parameters: walletId, amount, address");
  }
  if (amount === null) return fail("Invalid amount.");

  const wallet = ctx.wallet ?? (await loadWallet("withdraw", walletId));
  if (!wallet || !wallet.isActive || wallet.category !== "CRYPTO") {
    return fail("This withdrawal method is unavailable.");
  }

  if (amount < wallet.min || amount > wallet.max) {
    return fail(`Amount must be between ${wallet.min} and ${wallet.max}.`);
  }

  if (await userHasAgent(user)) {
    return fail("This withdrawal method is unavailable for agent-linked accounts.");
  }

  const exchangeRate = await db.dollerRate.findUnique({ where: { id: "global" } });
  const convertedAmount = convertCurrency(user.wallet.currencyCode, amount, exchangeRate);

  // atomic debit: only succeeds if the balance is still enough right now
  const debited = await db.wallet.updateMany({
    where: { userId: user.id, balance: { gte: convertedAmount } },
    data: { balance: { decrement: convertedAmount } },
  });
  if (debited.count === 0) return fail("Insufficient balance.");

  const withdraw = await db.withdraw.create({
    data: {
      paymentWalletNumber: address,
      amount,
      status: "PENDING",
      userId: user.id,
      withdrawEWalletID: walletId,
      merchantId: uuidv4(),
    },
  });

  await sendAdminNotification({
    id: crypto.randomUUID(),
    type: "WITHDRAW",
    title: "New crypto withdraw found",
    description: `User : ${user.phone || user.email || user.playerId}, created a withdrawl request for $${withdraw.amount}`,
    createdAt: new Date().toISOString(),
    link: "/payment/withdraws",
  });

  return ok({
    message: "Withdrawal request submitted and is pending admin review.",
    withdrawId: withdraw.id,
  });
}
