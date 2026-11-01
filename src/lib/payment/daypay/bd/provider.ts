import { db } from "@/lib/db";
import { normaliseName } from "../common/methods";
import { newOrderNo } from "../common/order";
import type {
  MethodKey,
  PaymentProvider,
  ProviderRequest,
  ProviderResult,
} from "../common/types";
import {
  BD_DEPOSIT_PREFIX,
  BD_WITHDRAW_PREFIX,
  bdConfig,
  bdConfigured,
  bdPost,
} from "./client";

/**
 * BD provider: bKash, Nagad, Rocket.
 *   deposit : POST /payment/create   -> user is sent to param.payment_url
 *   withdraw: POST /pay/transfer     -> final result arrives on the callback
 * Callbacks (GET, credit / refund) live in ./callbacks.ts, served at:
 *   /api/payment/bd/callback/payin  and  /api/payment/bd/callback/payout
 */
const HISTORY_PATH = "/account/transaction";

/** Collection types: Bkash, Bkashbiz, Nagad, Nagadbiz, Rocketbiz. */
const depositType = (method: MethodKey, walletName: string): string | null => {
  // a wallet the admin named "... Business" uses the business channel
  const biz = /biz|business|merchant/.test(normaliseName(walletName));
  switch (method) {
    case "bkash":
      return biz ? "Bkashbiz" : "Bkash";
    case "nagad":
      return biz ? "Nagadbiz" : "Nagad";
    case "rocket":
      return "Rocketbiz"; // the only Rocket collection type
    default:
      return null; // Upay: no type in the doc yet
  }
};

/** Payout bank types: bKash, Nagad, Rocket (note the "bKash" spelling). */
const PAYOUT_TYPE: Partial<Record<MethodKey, string>> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
};

const unsupported = (r: ProviderRequest): ProviderResult => ({
  ok: false,
  status: 400,
  message: `${r.wallet.walletName} isn't wired up yet.`,
});

const notConfigured = (r: ProviderRequest): ProviderResult => {
  console.error(`[bd-pay] missing env config for ${r.method}`);
  return {
    ok: false,
    status: 503,
    message: `${r.wallet.walletName} is temporarily unavailable.`,
  };
};

const codeOf = (code: unknown): number | null => {
  const n = Number(code);
  return code === undefined || code === null || code === "" || Number.isNaN(n)
    ? null
    : n;
};

export const bdPayProvider: PaymentProvider = {
  key: "bd-pay",

  async deposit(r): Promise<ProviderResult> {
    const type = depositType(r.method, r.wallet.walletName);
    if (!type) return unsupported(r);
    if (!bdConfigured()) return notConfigured(r);

    const c = bdConfig();
    const orderid = newOrderNo(BD_DEPOSIT_PREFIX);

    // Create the record first so the callback can always find it.
    const deposit = await db.deposit.create({
      data: {
        amount: r.amount,
        payFrom: r.wallet.walletName,
        status: "PENDING",
        merchantId: orderid,
        user: { connect: { id: r.ctx.user.id } },
        ewallet: { connect: { id: r.wallet.id } },
      },
    });
    const dropRecord = () =>
      db.deposit.deleteMany({ where: { id: deposit.id, status: "PENDING" } });

    try {
      const res = await bdPost("/payment/create", {
        value: String(r.amount),
        type,
        orderid,
        notifyurl: `${c.notifyBase}/api/payment/bd/callback/payin`,
        callbackurl: `${c.notifyBase}${HISTORY_PATH}`,
        IP: r.ctx.ip, // sent, but not part of the signature
      });

      const url = res.param?.payment_url;
      if (codeOf(res.code) === 200 && url) {
        return { ok: true, message: res.info, redirectUrl: url };
      }

      console.error("[bd-pay] collection rejected", res.code, res.info);
      await dropRecord();
      return { ok: false, status: 502, message: "Deposit Failed" };
    } catch (error) {
      console.error("[bd-pay] collection request failed", error);
      await dropRecord();
      return { ok: false, status: 502, message: "Deposit Failed" };
    }
  },

  async withdraw(r): Promise<ProviderResult> {
    const type = PAYOUT_TYPE[r.method];
    if (!type) return unsupported(r);
    if (!bdConfigured()) return notConfigured(r);

    const c = bdConfig();
    const orderNo = newOrderNo(BD_WITHDRAW_PREFIX);
    const name =
      [r.ctx.user.firstName, r.ctx.user.lastName].filter(Boolean).join(" ") ||
      "Player";

    // Record first (PENDING) so the callback can find it even if our request
    // to the gateway times out.
    const withdraw = await db.withdraw.create({
      data: {
        paymentWalletNumber: r.account,
        amount: r.amount,
        status: "PENDING",
        merchantId: orderNo,
        user: { connect: { id: r.ctx.user.id } },
        withdrawEWallet: { connect: { id: r.wallet.id } },
      },
    });

    const submitted: ProviderResult = {
      ok: true,
      message: "Withdrawal submitted",
      redirectUrl: HISTORY_PATH, // the UI redirects on res.data
    };

    let res;
    try {
      res = await bdPost("/pay/transfer", {
        order_no: orderNo,
        type,
        name,
        account_number: r.account,
        money: String(r.amount),
        notify_url: `${c.notifyBase}/api/payment/bd/callback/payout`,
      });
    } catch (error) {
      // Per the gateway doc: no answer = blocked order. Never refund and never
      // resubmit. The callback (or support) settles it.
      console.error(
        "[bd-pay] payout no response, left PENDING",
        orderNo,
        error,
      );
      return submitted;
    }

    const code = codeOf(res.code);
    if (code === 200) return submitted;

    // No usable code, or a server error: unknown, keep PENDING.
    if (code === null || code >= 500) {
      console.error("[bd-pay] payout unclear, left PENDING", orderNo, res);
      return submitted;
    }

    // Any other code (e.g. 400): the gateway refused it. Close it, the shared
    // handler refunds.
    console.error("[bd-pay] payout rejected", res.code, res.info);
    await db.withdraw.updateMany({
      where: { id: withdraw.id, status: "PENDING" },
      data: { status: "REJECTED" },
    });
    return { ok: false, status: 502, message: "Withdraw Failed" };
  },
};
