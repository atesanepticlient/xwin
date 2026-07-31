import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CasinoBetStatus, BettingCategory, Prisma } from "@prisma/client";
import { findCurrentUser } from "@/data/user";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    const tab = searchParams.get("tab") || "website";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const outcomeFilter = (searchParams.get("outcome") || "ALL") as
      | "ALL"
      | "WON"
      | "LOST"
      | "DRAW";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Default window widened to 90 days so we stop silently excluding
    // data that's older than a week. If startDate/endDate are sent but
    // unparseable, fall back instead of passing Invalid Date to Prisma
    // (which can silently produce zero matches).
    const now = new Date();
    const defaultStart = new Date();
    defaultStart.setDate(now.getDate() - 90);

    let fromDate = defaultStart;
    if (startDateParam) {
      const parsed = new Date(startDateParam);
      if (!isNaN(parsed.getTime())) fromDate = parsed;
    }

    let toDate = now;
    if (endDateParam) {
      const parsed = new Date(endDateParam);
      if (!isNaN(parsed.getTime())) {
        // include the entire end day, not just 00:00:00
        parsed.setHours(23, 59, 59, 999);
        toDate = parsed;
      }
    }

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
      orderBy: { createdAt: sortOrder },
    });

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

    // Debug trail — visible in your server terminal (not sent to browser)
    // so you can see exactly what was queried without guessing.
    console.log("[bet-history]", {
      userId: user.id,
      tab,
      status,
      category,
      outcomeFilter,
      fromDate,
      toDate,
      rawCount: rawBets.length,
      filteredCount: data.length,
    });

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
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch bet history",
      },
      { status: 500 },
    );
  }
}
