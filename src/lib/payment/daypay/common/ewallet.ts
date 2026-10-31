import { db } from "@/lib/db";
import { findMethod } from "./methods";
import { userHasAgent } from "./context";
import { asAmount, asString, fail, ok } from "./http";
import { loadWallet } from "./wallets";
import type {
  CountryModule,
  PaymentContext,
  PaymentFlow,
  ProviderResult,
} from "./types";

/**
 * Shared POST logic for every country's e-wallets (bKash, Nagad, JazzCash ...).
 * It does the checks that were copy-pasted in each old route, then hands the
 * gateway part to the country's own provider (bd/provider.ts, pk/provider.ts).
 */
const toWire = (result: ProviderResult) =>
  result.ok
    ? ok({
        code: 200, // shape the existing UI already reads: res.code / res.data
        msg: result.message ?? "success",
        data: result.redirectUrl,
      })
    : fail(result.message ?? "Payment failed", result.status ?? 400);

export async function ewalletPost(
  flow: PaymentFlow,
  ctx: PaymentContext,
  country: CountryModule,
): Promise<Response> {
  const { user, body } = ctx;

  if (flow === "withdraw" && user.isBanned) {
    return fail("Your withdrawal is temporary blocked! Contact support");
  }

  const walletId = asString(body.walletId);
  // accept old (transAmt / account_number) and new (amount / account) names
  const amount = asAmount(body.amount ?? body.transAmt);
  const account = asString(
    body.account ?? body.accountNumber ?? body.account_number,
  );

  if (!walletId) return fail("Missing required parameter: walletId");
  if (amount === null) return fail("Invalid amount.");
  if (flow === "withdraw" && !account) {
    return fail("Withdrawal failed! Try again");
  }

  const wallet = ctx.wallet ?? (await loadWallet(flow, walletId));
  if (!wallet || !wallet.isActive || wallet.category !== "MOBILE_BANKING") {
    return fail(
      flow === "deposit"
        ? "This deposit method is unavailable."
        : "This withdrawal method is unavailable.",
    );
  }

  const method = findMethod(country.methods, wallet.walletName);
  if (!method) return fail("This method is not allowed");

  if (amount < wallet.min || amount > wallet.max) {
    return fail(`Amount must be between ${wallet.min} and ${wallet.max}.`);
  }

  if (flow === "withdraw" && (await userHasAgent(user))) {
    return fail(
      "This withdrawal method is unavailable for agent-linked accounts.",
    );
  }

  const provider = country.provider;
  const request = { ctx, method: method.key, wallet, amount, account };

  if (flow === "deposit") {
    try {
      return toWire(await provider.deposit(request));
    } catch (error) {
      console.error(`[payment] ${provider.key} deposit failed`, error);
      return fail("Payment failed", 500);
    }
  }

  // ---- withdraw: atomic debit first, refund if the provider does not accept ----
  const debit = await db.wallet.updateMany({
    where: { userId: user.id, balance: { gte: amount } },
    data: { balance: { decrement: amount } },
  });
  if (debit.count === 0) return fail("Insufficient balance.");

  const refund = () =>
    db.wallet.update({
      where: { userId: user.id },
      data: { balance: { increment: amount } },
    });

  try {
    const result = await provider.withdraw(request);
    if (!result.ok) await refund();
    return toWire(result);
  } catch (error) {
    console.error(`[payment] ${provider.key} withdraw failed`, error);
    await refund();
    return fail("Payment failed", 500);
  }
}
