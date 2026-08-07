import { NextRequest, NextResponse } from "next/server";
import {
  CONFIG,
  cleanParams,
  buildSign,
  postJson,
  CreateCollectionParams,
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

    if (user.wallet?.currencyCode != "BDT") {
      return NextResponse.json(
        { error: "This method is not allowed" },
        { status: 400 },
      );
    }

    const body: CreateCollectionParams & { walletId: string } =
      await req.json();

    const merchantOrderId = uuidv4();
    const payerKey = user.playerId;
    const payerName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || "Win Player";
    const callbackUrl = "";
    const ip = getClientIp(req);

    const { transAmt, payType, walletId } = body;

    if (!transAmt || !payType || !walletId) {
      return NextResponse.json(
        { error: "Missing required parameters: transAmt, payType, walletId" },
        { status: 400 },
      );
    }

    const amount = Number(transAmt);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const ewallet = await db.depositEWallet.findUnique({
      where: { id: walletId },
      select: {
        id: true,
        walletName: true,
        isActive: true,
        minDeposit: true,
        maxDeposit: true,
      },
    });

    if (!ewallet || !ewallet.isActive) {
      return NextResponse.json(
        { error: "This deposit method is unavailable." },
        { status: 400 },
      );
    }

    if (
      amount < Number(ewallet.minDeposit) ||
      amount > Number(ewallet.maxDeposit)
    ) {
      return NextResponse.json(
        {
          error: `Amount must be between ${ewallet.minDeposit} and ${ewallet.maxDeposit}.`,
        },
        { status: 400 },
      );
    }

    const params: Record<string, unknown> = {
      merchantId: CONFIG.merchantId,
      merchantOrderId,
      transAmt: String(amount),
      payType,
      payerKey,
      payerName,
      ip,
      orderRemark: "Deposit",
      callbackUrl,
    };

    const sign = buildSign(params);

    const data = await postJson(
      "/api/order/api/payOrder/publicCreatePayOrder",
      {
        ...cleanParams(params),
        sign,
      },
    );

    if (data?.code === 200) {
      await db.deposit.create({
        data: {
          amount,
          payFrom: ewallet.walletName,
          status: "PENDING",
          merchantId: merchantOrderId,
          user: { connect: { id: user.id } },
          ewallet: { connect: { id: ewallet.id } },
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
