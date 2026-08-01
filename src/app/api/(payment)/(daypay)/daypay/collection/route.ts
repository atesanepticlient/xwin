// app/api/payment/deposit-callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { verifySignature } from "@/lib/beidou";
import { calculateBonus } from "@/lib/helpers";

export const setPayinBonus = async (
  tx: Prisma.TransactionClient,
  userId: string,
  payinAmount: number,
): Promise<void> => {
  const allPayinBonus = await tx.payinBonus.findMany({
    where: { userId },
  });

  const bonusSetting = await tx.bonusSetting.findUnique({
    where: { id: "global" },
  });

  if (!bonusSetting) return;

  const now = new Date();

  // Sequential loop safely executes inside the transaction
  for (const bonus of allPayinBonus) {
    if (!bonus.claimedBonus && bonus.isActive && bonus.expiry > now) {
      let bonusAmount = 0;
      let message = "";

      if (bonus.type === "FIRST_PAYIN") {
        bonusAmount = calculateBonus(
          payinAmount,
          bonusSetting.firstPayin,
          bonusSetting.firstPayinUpTo,
        );
        message = "First deposit bonus has been added to your account";
      } else if (bonus.type === "INVITATION") {
        bonusAmount = calculateBonus(
          payinAmount,
          bonusSetting.referPayin,
          bonusSetting.referPayinUpTo,
        );
        message = "Invitation bonus has been added to your account";
      }

      // 1. Deactivate bonus and record claimed amount
      await tx.payinBonus.update({
        where: { id: bonus.id },
        data: { isActive: false, claimedBonus: bonusAmount },
      });

      // 2. Credit wallet and notify user if bonus > 0
      if (bonusAmount > 0) {
        await tx.wallet.update({
          where: { userId },
          data: { balance: { increment: bonusAmount } },
        });

        await tx.message.create({
          data: {
            user: { connect: { id: userId } },
            title: `${bonusAmount} BDT Bonus added`,
            description: message,
          },
        });
      }
    }
  }
};

export const setReferBonusToReferer = async (
  tx: Prisma.TransactionClient,
  userId: string,
  payinAmount: number,
) => {
  const deposit = await tx.deposit.findMany({
    where: { userId, status: "ACCEPTED" },
  });
  if (deposit.length > 1) return;

  const userWithReferrer = await db.users.findUnique({
    where: { id: userId },
    select: {
      referredById: true, // Direct ID of the parent Referral record
      referredBy: {
        select: {
          userId: true, // The User ID of the person who referred them
          user: {
            select: {
              id: true,
              referId: true, // Their promo/referral code (e.g., "REF123")
              email: true,
            },
          },
        },
      },
    },
  });

  const referrerUserId = userWithReferrer?.referredBy?.userId;
  if (!referrerUserId) return;

  const bonusSetting = await tx.bonusSetting.findUnique({
    where: { id: "global" },
  });
  if (!bonusSetting) return;

  const invitationCashback = await db.cashback.create({
    data: {
      userId: referrerUserId,
      type: "INVITATION",
      amount: null, // Can be null or updated later
      expiry: null, // Admin will set expiry later when making claimable: true
      hasClaimed: false,
      claimable: false, // Initially false until activated
    },
  });

  if (!invitationCashback) return;

  const bonusAmount = calculateBonus(
    payinAmount,
    bonusSetting.inviationCode,
    bonusSetting.referPayinUpTo,
  );

 
  if (bonusAmount > 0) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    await tx.cashback.update({
      where: { id: invitationCashback?.id },
      data: {
        amount: bonusAmount,
        hasClaimed: false,
        claimable: true,
        expiry: expiryDate,
        
      },
    });
    await tx.message.create({
      data: {
        user: { connect: { id: userId } },
        title: `Bonus cashback added`,
        description: "You got new cashback bonus! Please claim this",
      },
    });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { searchParams } = req.nextUrl;

    const merchantId = searchParams.get("merchantId");
    const merchantOrderId = searchParams.get("merchantOrderId");
    const orderStatus = searchParams.get("orderStatus");
    const payType = searchParams.get("payType");
    const sign = searchParams.get("sign");
    const transAmt = searchParams.get("transAmt");

    if (
      !merchantId ||
      !merchantOrderId ||
      !orderStatus ||
      !payType ||
      !sign ||
      !transAmt
    ) {
      return NextResponse.json(
        { error: "Required input missing" },
        { status: 400 },
      );
    }

    const secretKey = process.env.BEIDOU_SECRET_KEY || "";
    if (!verifySignature(searchParams, secretKey)) {
      return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
    }

    const deposit = await db.deposit.findFirst({
      where: { merchantId: merchantOrderId },
    });

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    // Prevents duplicate processing on gateway retries
    if (deposit.status === "ACCEPTED" || deposit.status === "REJECTED") {
      return new NextResponse("success", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const statusNum = Number(orderStatus);
    const numericAmount = Number(transAmt);

    await db.$transaction(async (tx) => {
      const depositData: Prisma.DepositUpdateInput = {};
      let shouldCredit = false;

      if (statusNum === 3) {
        depositData.status = "ACCEPTED";

        shouldCredit = true;
      } else if (statusNum === 5) {
        depositData.status = "REJECTED";
      }

      const updatedDeposit = await tx.deposit.update({
        where: { id: deposit.id },
        data: depositData,
        select: { userId: true },
      });

      // Credit wallet only when payment succeeds (status 3)
      if (shouldCredit) {
        await tx.wallet.update({
          where: { userId: updatedDeposit.userId },
          data: {
            balance: { increment: numericAmount },
          },
        });
        await setPayinBonus(tx, updatedDeposit.userId, numericAmount);
        await setReferBonusToReferer(tx, updatedDeposit.userId, numericAmount);
      }
    });

    return new NextResponse("success", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("[Deposit Callback Error]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
