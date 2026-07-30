import { NextRequest, NextResponse } from "next/server";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";
import { INTERNAL_SERVER_ERROR } from "@/error";

export async function POST(req: NextRequest) {
  try {
    const user = await findCurrentUser();
    if (!user)
      return NextResponse.json(
        { error: "Authentication error!" },
        { status: 401 },
      );

    const body = await req.json();
    const { walletId, amount, transactionId } = body;

    if (!walletId || !amount || !transactionId) {
      return NextResponse.json(
        {
          error: "Missing required parameters: walletId, amount, transactionId",
        },
        { status: 400 },
      );
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const ewallet = await db.depositEWallet.findUnique({
      where: { id: walletId },
      include: { cryptoWallet: true },
    });

    if (
      !ewallet ||
      !ewallet.isActive ||
      ewallet.category !== "CRYPTO" ||
      !ewallet.cryptoWallet
    ) {
      return NextResponse.json(
        { error: "This deposit method is unavailable." },
        { status: 400 },
      );
    }

    if (
      numAmount < Number(ewallet.minDeposit) ||
      numAmount > Number(ewallet.maxDeposit)
    ) {
      return NextResponse.json(
        {
          error: `Amount must be between ${ewallet.minDeposit} and ${ewallet.maxDeposit}.`,
        },
        { status: 400 },
      );
    }

    // Prevent the exact same trx hash being submitted twice (double-claim protection)
    const existing = await db.deposit.findFirst({
      where: { merchantId: transactionId, ewalletId: walletId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This transaction ID has already been submitted." },
        { status: 400 },
      );
    }

    const deposit = await db.deposit.create({
      data: {
        payFrom: `Crypto: ${ewallet.cryptoWallet.currencyCode} (${ewallet.cryptoWallet.network})`,
        amount: numAmount,
        merchantId: transactionId,
        status: "PENDING",
        userId: user.id,
        ewalletId: walletId,
      },
    });

    return NextResponse.json({
      message: "Deposit request submitted. It will be reviewed shortly.",
      depositId: deposit.id,
    });
  } catch (error) {
    console.log({ error });
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
