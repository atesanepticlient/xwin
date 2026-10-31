import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import {
  CONFIG,
  buildSign,
  cleanParams,
  postJson,
} from "@/lib/beidou";
import type { MethodKey, PaymentProvider, ProviderRequest, ProviderResult } from "../types";

/**
 * BD provider "Beidou" (a.k.a. DayPay): bKash, Nagad, Rocket.
 * Logic moved 1:1 from the old /api/collection and /api/withdrawal/payment.
 * Webhooks stay where they are: /api/daypay/collection and /api/daypay/payment.
 */
const PAY_TYPE: Partial<Record<MethodKey, number>> = {
  nagad: 1,
  bkash: 2,
  rocket: 3,
};

const payerName = (r: ProviderRequest) =>
  [r.ctx.user.firstName, r.ctx.user.lastName].filter(Boolean).join(" ") ||
  "Win Player";

export const beidouProvider: PaymentProvider = {
  key: "beidou",

  async deposit(r): Promise<ProviderResult> {
    const payType = PAY_TYPE[r.method];
    if (payType == null) {
      return { ok: false, status: 400, message: "This payment method isn't wired up yet." };
    }

    const merchantOrderId = uuidv4();
    const params: Record<string, unknown> = {
      merchantId: CONFIG.merchantId,
      merchantOrderId,
      transAmt: String(r.amount),
      payType,
      payerKey: r.ctx.user.playerId,
      payerName: payerName(r),
      ip: r.ctx.ip,
      orderRemark: "Deposit",
      callbackUrl: process.env.CLINET_URL,
    };

    // postJson throws when the gateway answers with code !== 200.
    const data = await postJson<string>(
      "/api/order/api/payOrder/publicCreatePayOrder",
      { ...cleanParams(params), sign: buildSign(params) },
    );

    await db.deposit.create({
      data: {
        amount: r.amount,
        payFrom: r.wallet.walletName,
        status: "PENDING",
        merchantId: merchantOrderId,
        user: { connect: { id: r.ctx.user.id } },
        ewallet: { connect: { id: r.wallet.id } },
      },
    });

    return {
      ok: true,
      message: data.msg,
      redirectUrl: typeof data.data === "string" ? data.data : undefined,
    };
  },

  async withdraw(r): Promise<ProviderResult> {
    const payType = PAY_TYPE[r.method];
    if (payType == null) {
      return { ok: false, status: 400, message: "This payment method isn't wired up yet." };
    }

    const merchantOrderId = uuidv4();
    const params: Record<string, unknown> = {
      merchantId: CONFIG.merchantId,
      merchantOrderId,
      account: r.account,
      transAmt: String(r.amount),
      bnkCode: "",
      ip: r.ctx.ip,
      name: payerName(r),
      payType: String(payType),
      remark: `Withdraw via ${r.wallet.walletName}`,
      callbackUrl: "",
    };

    const data = await postJson<string>(
      "/api/order/api/order/publicWithdrawal",
      { ...cleanParams(params), sign: buildSign(params) },
    );

    await db.withdraw.create({
      data: {
        paymentWalletNumber: r.account,
        amount: r.amount,
        status: "PENDING",
        merchantId: merchantOrderId,
        user: { connect: { id: r.ctx.user.id } },
        withdrawEWallet: { connect: { id: r.wallet.id } },
      },
    });

    return {
      ok: true,
      message: data.msg,
      redirectUrl: typeof data.data === "string" ? data.data : undefined,
    };
  },
};
