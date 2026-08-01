// app/api/payment/payout-callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { verifySignature } from "@/lib/beidou"; // or embed verifySignature above

export const POST = async (req: NextRequest) => {
  try {
    const { searchParams } = req.nextUrl;

    const merchantId = searchParams.get("merchantId");
    const merchantOrderId = searchParams.get("merchantOrderId");
    const orderStatus = searchParams.get("orderStatus");
    const payType = searchParams.get("payType");
    const sign = searchParams.get("sign");
    const transAmt = searchParams.get("transAmt");

    // 1. Basic validation
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

    // 2. Verify signature matching Java MD5 logic
    const secretKey = process.env.BEIDOU_SECRET_KEY || "";
    if (!verifySignature(searchParams, secretKey)) {
      return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
    }

    // 3. Find Withdrawal record
    const withdraw = await db.withdraw.findFirst({
      where: { merchantId: merchantOrderId },
    });

    if (!withdraw) {
      return NextResponse.json(
        { error: "Withdrawal not found" },
        { status: 404 },
      );
    }

    // Prevents duplicate processing on gateway retries
    if (withdraw.status === "ACCEPTED" || withdraw.status === "REJECTED") {
      return new NextResponse("success", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const statusNum = Number(orderStatus);
    const numericAmount = Number(transAmt);

    // 4. Perform atomic update
    await db.$transaction(async (tx) => {
      const withdrawalData: Prisma.WithdrawUpdateInput = {};
      let shouldRefund = false;

      if (statusNum === 3) {
        withdrawalData.status = "ACCEPTED";
      } else if (statusNum === 5) {
        withdrawalData.status = "REJECTED";
        shouldRefund = true;
      }

      const updatedWithdraw = await tx.withdraw.update({
        where: { id: withdraw.id },
        data: withdrawalData,
        select: { userId: true },
      });

      // Refund balance back to user's wallet if payout failed (status 5)
      if (shouldRefund) {
        await tx.wallet.update({
          where: { userId: updatedWithdraw.userId },
          data: {
            balance: { increment: numericAmount },
          },
        });
      }
    });

    // 5. Acknowledge with exact "success" string
    return new NextResponse("success", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("[Payout Callback Error]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
