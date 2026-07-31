import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CasinoBetStatus, BettingCategory, Prisma } from "@prisma/client";
import { findCurrentUser } from "@/data/user";

export async function GET(request: Request) {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication failed!" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "website"; // "website" | "unsettled"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const outcome = searchParams.get("outcome"); // "ALL" | "WON" | "LOST" | "EVEN"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const now = new Date();
    const defaultStart = new Date();
    defaultStart.setDate(now.getDate() - 7);

    const fromDate = startDate ? new Date(startDate) : defaultStart;
    const toDate = endDate ? new Date(endDate) : now;

    const where: Prisma.BettingRecordWhereInput = {
      userId: user.id,
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    };

    if (tab === "unsettled") {
      where.status = CasinoBetStatus.RUNNING;
    } else if (status && status !== "ALL") {
      where.status = status as CasinoBetStatus;
    }

    if (category && category !== "ALL") {
      where.category = category as BettingCategory;
    }

    // Outcome filter: profileNLoss is the net return from the bet.
    // Positive = won, negative = lost, exactly zero = push/breakeven.
    if (outcome === "WON") {
      where.profileNLoss = { gt: 0 };
    } else if (outcome === "LOST") {
      where.profileNLoss = { lt: 0 };
    } else if (outcome === "EVEN") {
      where.profileNLoss = { equals: 0 };
    }

    const bets = await db.bettingRecord.findMany({
      where,
      orderBy: {
        createdAt: sortOrder,
      },
    });

    // Prisma Decimal doesn't serialize to a plain number automatically in
    // a shape the frontend can rely on — convert explicitly so the client
    // gets real numbers, not Decimal-string objects.
    const data = bets.map((b) => ({
      id: b.id,
      createdAt: b.createdAt,
      name: b.name,
      category: b.category,
      betAmount: Number(b.betAmount),
      profileNLoss: b.profileNLoss != null ? Number(b.profileNLoss) : null,
      status: b.status,
      orderNo: b.orderNo,
    }));

    // Aggregate summary for the current filtered range — total staked,
    // net profit/loss, win count vs loss count. Lets the UI show a
    // quick "you're up/down X" without a second round trip.
    const totals = data.reduce(
      (acc, b) => {
        acc.totalStaked += b.betAmount;
        if (b.profileNLoss != null) {
          acc.netProfitLoss += b.profileNLoss;
          if (b.profileNLoss > 0) acc.wins += 1;
          else if (b.profileNLoss < 0) acc.losses += 1;
          else acc.evens += 1;
        }
        return acc;
      },
      { totalStaked: 0, netProfitLoss: 0, wins: 0, losses: 0, evens: 0 },
    );

    return NextResponse.json({
      success: true,
      data,
      summary: totals,
      currency: user.wallet?.currencyCode ?? "SGD",
      dateRange: {
        from: fromDate.toLocaleDateString("en-GB"),
        to: toDate.toLocaleDateString("en-GB"),
      },
    });
  } catch (error) {
    console.error("Error fetching bet history:", error);
    return NextResponse.json(
      { error: "Failed to fetch bet history" },
      { status: 500 },
    );
  }
}
