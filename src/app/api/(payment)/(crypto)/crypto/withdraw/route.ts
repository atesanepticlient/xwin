import { NextRequest, NextResponse } from "next/server";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { v4 as uuidv4 } from "uuid";
import { sendAdminNotification } from "@/lib/notifications";
import { convertCurrency } from "@/lib/helpers";
export async function POST(req: NextRequest) {
  try {
    const user = await findCurrentUser();
    if (!user)
      return NextResponse.json(
        { error: "Authentication error!" },
        { status: 401 },
      );

    if (user.isBanned) {
      return NextResponse.json(
        { error: "Your withdrawal is temporary blocked! Contact support" },
        { status: 400 },
      );
    }
    if (!user.wallet?.currencyCode) {
      return NextResponse.json(
        { error: "Withdrawal is blocked at the moment!" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { walletId, amount, address } = body;

    const trxId = uuidv4();

    if (!walletId || !amount || !address) {
      return NextResponse.json(
        { error: "Missing required parameters: walletId, amount, address" },
        { status: 400 },
      );
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const ewallet = await db.withdrawEWallet.findUnique({
      where: { id: walletId },
    });

    if (!ewallet || !ewallet.isActive || ewallet.category !== "CRYPTO") {
      return NextResponse.json(
        { error: "This withdrawal method is unavailable." },
        { status: 400 },
      );
    }

    if (
      numAmount < Number(ewallet.minWithdraw) ||
      numAmount > Number(ewallet.maxWithdraw)
    ) {
      return NextResponse.json(
        {
          error: `Amount must be between ${ewallet.minWithdraw} and ${ewallet.maxWithdraw}.`,
        },
        { status: 400 },
      );
    }

    // Agent-linked users shouldn't withdraw through regular e-wallet rails,
    // mirroring the rule already applied in /api/payment-methods.
    const dbUser = await db.users.findUnique({
      where: { id: user.id },
      select: { agentId: true },
    });
    if (dbUser?.agentId) {
      return NextResponse.json(
        {
          error:
            "This withdrawal method is unavailable for agent-linked accounts.",
        },
        { status: 400 },
      );
    }

    const exchangeRate = await db.dollerRate.findUnique({
      where: { id: "global" },
    });

    const convertedAmount = convertCurrency(
      user.wallet?.currencyCode!,
      amount,
      exchangeRate,
    );

    // Atomic debit — only succeeds if balance was still sufficient at this instant.
    const debited = await db.wallet.updateMany({
      where: { userId: user.id, balance: { gte: convertedAmount } },
      data: { balance: { decrement: convertedAmount } },
    });

    if (debited.count === 0) {
      return NextResponse.json(
        { error: "Insufficient balance." },
        { status: 400 },
      );
    }

    const withdraw = await db.withdraw.create({
      data: {
        paymentWalletNumber: address,
        amount: numAmount,
        status: "PENDING",
        userId: user.id,
        withdrawEWalletID: walletId,
        merchantId: trxId,
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
    return NextResponse.json({
      message: "Withdrawal request submitted and is pending admin review.",
      withdrawId: withdraw.id,
    });
  } catch (error) {
    console.log({ error });
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
