import { db } from "@/lib/db";
import type {
  MethodKey,
  PaymentProvider,
  ProviderRequest,
  ProviderResult,
} from "../common/types";
import { newOrderNo } from "../common/order";
import {
  PK_DEPOSIT_PREFIX,
  PK_WITHDRAW_PREFIX,
  pkConfig,
  pkConfigured,
  pkPost,
} from "./client";

/**
 * PK provider: JazzCash and EasyPaisa (Merchant Payment API v1).
 *   deposit : POST /api/v1/receive/createOrder -> user is sent to data.pay_url
 *   withdraw: POST /api/v1/payout/createOrder  -> final result arrives on callback
 * Callbacks live in ./callbacks.ts:
 *   /api/payment/pk/callback/payin  and  /api/payment/pk/callback/payout
 *
 * `passage` must be a channel activated for the merchant. Defaults are the
 * examples from the doc (JAZZ, EP); override with env if the platform says otherwise.
 */
const passage = (m: MethodKey) =>
  m === "jazzcash"
    ? (process.env.PKPAY_PASSAGE_JAZZCASH ?? "JAZZ")
    : m === "easypaisa"
      ? (process.env.PKPAY_PASSAGE_EASYPAISA ?? "EP")
      : undefined;

const HISTORY_PATH = "/account/transaction";
const MAX_ORDER_NO = 50; // mch_order_no limit
const MAX_NOTIFY_URL = 100; // notify_url limit

// Codes that mean "the order was NOT created" -> safe to close + refund.
// Anything else (9001, unknown, missing) is treated as unclear -> stay PENDING.
const NOT_CREATED_CODES = new Set([1001, 1002, 1003, 1004, 1005, 2002, 3001]);

const money = (v: unknown) => Number(v).toFixed(2);

const notConfigured = (r: ProviderRequest): ProviderResult => {
  console.error(`[pk-pay] missing env config for ${r.method}`);
  return {
    ok: false,
    status: 503,
    message: `${r.wallet.walletName} is temporarily unavailable.`,
  };
};

export const pkPayProvider: PaymentProvider = {
  key: "pk-pay",

  async deposit(r): Promise<ProviderResult> {
    const ch = passage(r.method);
    if (!pkConfigured() || !ch) return notConfigured(r);

    const c = pkConfig();
    const mchOrderNo = newOrderNo(PK_DEPOSIT_PREFIX);
    const notifyUrl = `${c.notifyBase}/api/payment/pk/callback/payin`;
    if (mchOrderNo.length > MAX_ORDER_NO || notifyUrl.length > MAX_NOTIFY_URL) {
      console.error("[pk-pay] order no / notify_url too long");
      return notConfigured(r);
    }

    // Create the record first so the callback can always find it.
    const deposit = await db.deposit.create({
      data: {
        amount: r.amount,
        payFrom: r.wallet.walletName,
        status: "PENDING",
        merchantId: mchOrderNo,
        user: { connect: { id: r.ctx.user.id } },
        ewallet: { connect: { id: r.wallet.id } },
      },
    });

    const dropRecord = () =>
      db.deposit.deleteMany({ where: { id: deposit.id, status: "PENDING" } });

    try {
      const res = await pkPost<{ pay_url?: string }>(
        "/api/v1/receive/createOrder",
        {
          passage: ch,
          mch_order_no: mchOrderNo,
          amount: money(r.amount),
          notify_url: notifyUrl,
        },
        String(r.ctx.user.playerId ?? ""), // X-User-Id header
      );

      const payUrl = res.data?.pay_url;
      if (res.code === 0 && payUrl) {
        return { ok: true, message: res.message, redirectUrl: payUrl };
      }

      console.error("[pk-pay] receive rejected", res.code, res.message);
      await dropRecord();
      return { ok: false, status: 502, message: "Deposit Failed" };
    } catch (error) {
      console.error("[pk-pay] receive request failed", error);
      await dropRecord();
      return { ok: false, status: 502, message: "Deposit Failed" };
    }
  },

  async withdraw(r): Promise<ProviderResult> {
    const ch = passage(r.method);
    if (!pkConfigured() || !ch) return notConfigured(r);

    const c = pkConfig();
    const mchOrderNo = newOrderNo(PK_WITHDRAW_PREFIX);
    const notifyUrl = `${c.notifyBase}/api/payment/pk/callback/payout`;
    if (mchOrderNo.length > MAX_ORDER_NO || notifyUrl.length > MAX_NOTIFY_URL) {
      console.error("[pk-pay] order no / notify_url too long");
      return notConfigured(r);
    }

    // Record first (status PENDING) so the callback can find it even if our
    // request to the gateway times out.
    const withdraw = await db.withdraw.create({
      data: {
        paymentWalletNumber: r.account,
        amount: r.amount,
        status: "PENDING",
        merchantId: mchOrderNo,
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
      res = await pkPost(
        "/api/v1/payout/createOrder",
        {
          passage: ch,
          mch_order_no: mchOrderNo,
          amount: money(r.amount),
          receive_account: r.account,
          notify_url: notifyUrl,
          extra_params: String(r.ctx.user.playerId ?? "").slice(0, 200),
        },
        String(r.ctx.user.playerId ?? ""),
      );
    } catch (error) {
      // No answer = the order may exist. Never refund and never resubmit.
      // The callback (or an active query) settles it.
      console.error(
        "[pk-pay] payout no response, left PENDING",
        mchOrderNo,
        error,
      );
      return submitted;
    }

    if (res.code === 0) return submitted;

    if (typeof res.code !== "number" || !NOT_CREATED_CODES.has(res.code)) {
      console.error("[pk-pay] payout unclear, left PENDING", mchOrderNo, res);
      return submitted;
    }

    // Gateway refused the order. Close it, the shared handler refunds.
    console.error("[pk-pay] payout rejected", res.code, res.message);
    await db.withdraw.updateMany({
      where: { id: withdraw.id, status: "PENDING" },
      data: { status: "REJECTED" },
    });
    return { ok: false, status: 502, message: "Withdraw Failed" };
  },
};
