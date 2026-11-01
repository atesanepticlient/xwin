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
 * PK provider: JazzCash and EasyPaisa.
 *   deposit : POST /payin/create   -> user is sent to data.pay_url
 *   withdraw: POST /payout/create  -> final result arrives on the callback
 * Callbacks (credit / refund) live in ./callbacks.ts, served at:
 *   /api/payment/pk/callback/payin  and  /api/payment/pk/callback/payout
 *
 * trade_type (pay-in) and bank_code (payout) for PK are NOT in the doc that was
 * shared (it only lists the US section). Put the values from the PK section in:
 *   PKPAY_TRADE_TYPE_JAZZCASH / PKPAY_TRADE_TYPE_EASYPAISA
 *   PKPAY_BANK_CODE_JAZZCASH  / PKPAY_BANK_CODE_EASYPAISA
 */
const tradeType = (m: MethodKey) =>
  m === "jazzcash"
    ? process.env.PKPAY_TRADE_TYPE_JAZZCASH
    : m === "easypaisa"
      ? process.env.PKPAY_TRADE_TYPE_EASYPAISA
      : undefined;

const bankCode = (m: MethodKey) =>
  m === "jazzcash"
    ? process.env.PKPAY_BANK_CODE_JAZZCASH
    : m === "easypaisa"
      ? process.env.PKPAY_BANK_CODE_EASYPAISA
      : undefined;

const HISTORY_PATH = "/account/transaction";

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
    const trade_type = tradeType(r.method);
    if (!pkConfigured() || !trade_type) return notConfigured(r);

    const c = pkConfig();
    const outTradeNo = newOrderNo(PK_DEPOSIT_PREFIX);

    // Create the record first so the callback can always find it.
    const deposit = await db.deposit.create({
      data: {
        amount: r.amount,
        payFrom: r.wallet.walletName,
        status: "PENDING",
        merchantId: outTradeNo,
        user: { connect: { id: r.ctx.user.id } },
        ewallet: { connect: { id: r.wallet.id } },
      },
    });

    const dropRecord = () =>
      db.deposit.deleteMany({ where: { id: deposit.id, status: "PENDING" } });

    try {
      const res = await pkPost<{ pay_url?: string }>("/payin/create", {
        trade_type,
        out_trade_no: outTradeNo,
        order_amount: String(r.amount),
        notify_url: `${c.notifyBase}/api/payment/pk/callback/payin`,
        back_url: `${c.notifyBase}${HISTORY_PATH}`,
        vip_id: r.ctx.user.playerId,
      });

      const payUrl = res.data?.pay_url;
      if (res.code === 200 && payUrl) {
        return { ok: true, message: res.msg, redirectUrl: payUrl };
      }

      console.error("[pk-pay] payin rejected", res.code, res.msg);
      await dropRecord();
      return { ok: false, status: 502, message: "Deposit Failed" };
    } catch (error) {
      console.error("[pk-pay] payin request failed", error);
      await dropRecord();
      return { ok: false, status: 502, message: "Deposit Failed" };
    }
  },

  async withdraw(r): Promise<ProviderResult> {
    const bank_code = bankCode(r.method);
    if (!pkConfigured() || !bank_code) return notConfigured(r);

    const c = pkConfig();
    const outTradeNo = newOrderNo(PK_WITHDRAW_PREFIX);
    const payeeName =
      [r.ctx.user.firstName, r.ctx.user.lastName].filter(Boolean).join(" ") ||
      "Player";

    // Record first (status PENDING) so the callback can find it even if our
    // request to the gateway times out.
    const withdraw = await db.withdraw.create({
      data: {
        paymentWalletNumber: r.account,
        amount: r.amount,
        status: "PENDING",
        merchantId: outTradeNo,
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
      res = await pkPost("/payout/create", {
        out_trade_no: outTradeNo,
        amount: String(r.amount),
        bank_code,
        payee_account: r.account,
        payee_name: payeeName,
        notify_url: `${c.notifyBase}/api/payment/pk/callback/payout`,
        vip_id: r.ctx.user.playerId,
      });
    } catch (error) {
      // Per the gateway doc: no answer = the order may exist. Never refund and
      // never resubmit. The callback (or support) settles it.
      console.error(
        "[pk-pay] payout no response, left PENDING",
        outTradeNo,
        error,
      );
      return submitted;
    }

    if (res.code === 200) return submitted;

    // Answer without a usable code, or a server error: unknown, keep PENDING.
    if (typeof res.code !== "number" || res.code >= 500) {
      console.error("[pk-pay] payout unclear, left PENDING", outTradeNo, res);
      return submitted;
    }

    // 4xx = the gateway refused the order. Close it, the shared handler refunds.
    console.error("[pk-pay] payout rejected", res.code, res.msg);
    await db.withdraw.updateMany({
      where: { id: withdraw.id, status: "PENDING" },
      data: { status: "REJECTED" },
    });
    return { ok: false, status: 502, message: "Withdraw Failed" };
  },
};
