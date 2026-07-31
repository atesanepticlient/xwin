import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CasinoBetStatus, BettingCategory, Prisma } from "@prisma/client";
import { findCurrentUser } from "@/data/user";

type Outcome = "WON" | "LOST" | "DRAW" | null;

const getOutcome = (
  status: CasinoBetStatus,
  betAmount: number,
  profitNLoss: number | null,
): Outcome => {
  if (status !== "SETTLED" || profitNLoss == null) return null;
  if (profitNLoss > betAmount) return "WON";
  if (profitNLoss === betAmount) return "DRAW";
  return "LOST";
};

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
    const outcomeFilter = (searchParams.get("outcome") || "ALL") as
      | "ALL"
      | "WON"
      | "LOST"
      | "DRAW";
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

    const rawBets = await db.bettingRecord.findMany({
      where,
      orderBy: {
        createdAt: sortOrder,
      },
    });

    // Convert Decimal -> number and compute outcome per row (return vs. stake,
    // not a pre-signed net value — see getOutcome above).
    let data = rawBets.map((b) => {
      const betAmount = Number(b.betAmount);
      const profitNLoss = b.profitNLoss != null ? Number(b.profitNLoss) : null;
      const outcome = getOutcome(b.status, betAmount, profitNLoss);
      const net = profitNLoss != null ? profitNLoss - betAmount : null;

      return {
        id: b.id,
        createdAt: b.createdAt,
        name: b.name,
        category: b.category,
        betAmount,
        profitNLoss,
        net,
        outcome,
        status: b.status,
        orderNo: b.orderNo,
        wagerCode: b.wagerCode,
        roundId: b.roundId,
      };
    });

    // Outcome filter applied in-memory since it depends on comparing two
    // columns (profitNLoss vs betAmount) — not expressible in a Prisma
    // `where` without raw SQL. Bounded by the date-range query above.
    if (outcomeFilter !== "ALL") {
      data = data.filter((b) => b.outcome === outcomeFilter);
    }

    const summary = data.reduce(
      (acc, b) => {
        acc.totalStaked += b.betAmount;
        if (b.net != null) {
          acc.netProfitLoss += b.net;
          if (b.outcome === "WON") acc.wins += 1;
          else if (b.outcome === "LOST") acc.losses += 1;
          else if (b.outcome === "DRAW") acc.draws += 1;
        }
        return acc;
      },
      { totalStaked: 0, netProfitLoss: 0, wins: 0, losses: 0, draws: 0 },
    );

    return NextResponse.json({
      success: true,
      data,
      summary,
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
