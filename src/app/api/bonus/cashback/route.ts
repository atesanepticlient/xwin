import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { findCurrentUser } from "@/data/user";

// GET: Fetch cashback list for the logged-in user
export async function GET() {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cashbacks = await db.cashback.findMany({
      where: { userId: user.id },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ cashbacks });
  } catch (error) {
    console.error("Fetch Cashback Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Claim a cashback item
export async function POST(req: Request) {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { cashbackId } = body;

    if (!cashbackId) {
      return NextResponse.json(
        { error: "Cashback ID is required" },
        { status: 400 },
      );
    }

    // 1. Fetch the specific cashback item
    const cashback = await db.cashback.findUnique({
      where: { id: cashbackId, userId: user.id },
    });

    if (!cashback) {
      return NextResponse.json(
        { error: "Cashback record not found" },
        { status: 404 },
      );
    }

    // 2. Check if claimable by model conditions
    if (!cashback.claimable) {
      return NextResponse.json(
        { error: "This cashback is not yet claimable." },
        { status: 400 },
      );
    }

    if (cashback.hasClaimed) {
      return NextResponse.json(
        { error: "Cashback has already been claimed." },
        { status: 400 },
      );
    }

    // Check expiry if set
    if (cashback.expiry && new Date(cashback.expiry) < new Date()) {
      return NextResponse.json(
        { error: "This cashback offer has expired." },
        { status: 400 },
      );
    }

    const claimAmount = Number(cashback.amount ?? 0);
    if (claimAmount <= 0) {
      return NextResponse.json(
        { error: "Cashback amount is not yet set." },
        { status: 400 },
      );
    }

    // 3. Process the claim atomically inside a transaction
    await db.$transaction(async (tx) => {
      // Mark as claimed
      await tx.cashback.update({
        where: { id: cashbackId },
        data: { hasClaimed: true },
      });

      // Credit the bonus wallet
      await tx.wallet.update({
        where: { userId: user.id },

        data: {
          balance: { increment: claimAmount },
          //   turnOver: { increment: claimAmount * 1 },
        },
      });

      // Notify user
      await tx.message.create({
        data: {
          title: `You have successfully claimed ${claimAmount} BDT cashback!`,
          user: { connect: { id: user.id } },
        },
      });
    });

    return NextResponse.json({ success: true, claimedId: cashbackId });
  } catch (error) {
    console.error("Claim Cashback Error:", error);
    return NextResponse.json(
      { error: "Failed to process cashback claim" },
      { status: 500 },
    );
  }
}
