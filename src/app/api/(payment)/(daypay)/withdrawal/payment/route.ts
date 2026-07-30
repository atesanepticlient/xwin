import { NextRequest, NextResponse } from "next/server";
import {
  CONFIG,
  cleanParams,
  buildSign,
  postJson,
  CreatePaymentParams,
} from "@/lib/beidou";

import { v4 as uuidv4 } from "uuid";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";

const getClientIp = (req: NextRequest): string => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "0.0.0.0";
};

export async function POST(req: NextRequest) {
  try {
    const user = await findCurrentUser();
    if (!user)
      return NextResponse.json(
        { error: "Authentication error!" },
        { status: 401 },
      );

    const body: CreatePaymentParams & { walletId: string } = await req.json();

    const merchantOrderId = uuidv4();
    const payerName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || "Win Player";
    const callbackUrl = "";
    const ip = getClientIp(req);

    const { account, transAmt, bnkCode = "", payType, remark, walletId } = body;

    if (!account || !transAmt || !payType || !walletId) {
      return NextResponse.json(
        { error: "Withdrawal failed! Try again" },
        { status: 400 },
      );
    }

    const amount = Number(transAmt);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const ewallet = await db.withdrawEWallet.findUnique({
      where: { id: walletId },
      select: {
        id: true,
        walletName: true,
        isActive: true,
        minWithdraw: true,
        maxWithdraw: true,
      },
    });

    if (!ewallet || !ewallet.isActive) {
      return NextResponse.json(
        { error: "This withdrawal method is unavailable." },
        { status: 400 },
      );
    }

    if (
      amount < Number(ewallet.minWithdraw) ||
      amount > Number(ewallet.maxWithdraw)
    ) {
      return NextResponse.json(
        {
          error: `Amount must be between ${ewallet.minWithdraw} and ${ewallet.maxWithdraw}.`,
        },
        { status: 400 },
      );
    }

    const userAgent = await db.users.findUnique({
      where: { id: user.id },
      select: { agentId: true },
    });
    if (userAgent?.agentId) {
      return NextResponse.json(
        {
          error:
            "This withdrawal method is unavailable for agent-linked accounts.",
        },
        { status: 400 },
      );
    }

    // ---- Atomic debit BEFORE calling the gateway ----
    // Only succeeds if balance is still sufficient at this exact instant.
    // This closes the race window fully: two parallel requests can't both
    // pass, since the second one's updateMany will match zero rows once
    // the first has already decremented the balance.
    const debited = await db.wallet.updateMany({
      where: { userId: user.id, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    });

    if (debited.count === 0) {
      return NextResponse.json(
        { error: "Insufficient balance." },
        { status: 400 },
      );
    }

    const params: Record<string, unknown> = {
      merchantId: CONFIG.merchantId,
      merchantOrderId,
      account,
      transAmt: String(amount),
      bnkCode,
      ip,
      name: payerName,
      payType: String(payType),
      remark,
      callbackUrl,
    };

    const sign = buildSign(params);

    let data;
    try {
      data = await postJson("/api/order/api/order/publicWithdrawal", {
        ...cleanParams(params),
        sign,
      });
    } catch (gatewayError) {
      // Gateway call itself failed — refund immediately.
      await db.wallet.update({
        where: { userId: user.id },
        data: { balance: { increment: amount } },
      });
      throw gatewayError;
    }

    if (data?.code === 200) {
      await db.withdraw.create({
        data: {
          paymentWalletNumber: account,
          amount,
          status: "PENDING",
          merchantId: merchantOrderId,
          user: { connect: { id: user.id } },
          withdrawEWallet: { connect: { id: ewallet.id } },
        },
      });
    } else {
      // Gateway responded but rejected the order — refund the debit.
      await db.wallet.update({
        where: { userId: user.id },
        data: { balance: { increment: amount } },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
