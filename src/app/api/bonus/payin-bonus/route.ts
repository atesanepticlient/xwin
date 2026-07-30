import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { findCurrentUser } from "@/data/user";

// GET: Fetch user bonuses
export async function GET() {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bonuses = await db.payinBonus.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ bonuses });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Toggle / Update active bonus
export async function POST(req: Request) {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { selectedBonusId } = body; // string or null

    // Prevent selecting an expired or claimed bonus on backend
    if (selectedBonusId) {
      const targetBonus = await db.payinBonus.findUnique({
        where: { id: selectedBonusId, userId: user.id },
      });

      if (!targetBonus) {
        return NextResponse.json({ error: "Bonus not found" }, { status: 404 });
      }

      const isExpired = targetBonus.expiry
        ? new Date(targetBonus.expiry) < new Date()
        : false;
      const isClaimed =
        targetBonus.claimedBonus !== null &&
        Number(targetBonus.claimedBonus) > 0;

      if (isExpired || isClaimed) {
        return NextResponse.json(
          { error: "This bonus is no longer eligible" },
          { status: 400 },
        );
      }
    }

    // Run atomically inside a transaction to ensure only ONE option is active
    await db.$transaction(async (tx) => {
      // 1. Deactivate all existing bonuses for this user
      await tx.payinBonus.updateMany({
        where: { userId: user.id },
        data: { isActive: false },
      });

      // 2. If a valid, non-disabled bonus was selected, activate it
      if (selectedBonusId) {
        await tx.payinBonus.update({
          where: { id: selectedBonusId, userId: user.id },
          data: { isActive: true },
        });
      }
    });

    return NextResponse.json({ success: true, activeBonusId: selectedBonusId });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update bonus state" },
      { status: 500 },
    );
  }
}
