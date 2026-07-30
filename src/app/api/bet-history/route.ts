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
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Default 7-day range if no custom dates specified
    const now = new Date();
    const defaultStart = new Date();
    defaultStart.setDate(now.getDate() - 7);

    const fromDate = startDate ? new Date(startDate) : defaultStart;
    const toDate = endDate ? new Date(endDate) : now;

    // Build Prisma query condition dynamically
    const where: Prisma.BettingRecordWhereInput = {
      userId: user.id,
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    };

    // Tab-level restriction overrides status filter if set to "unsettled"
    if (tab === "unsettled") {
      where.status = CasinoBetStatus.RUNNING;
    } else if (status && status !== "ALL") {
      where.status = status as CasinoBetStatus;
    }

    // Category filtering
    if (category && category !== "ALL") {
      where.category = category as BettingCategory;
    }

    const bets = await db.bettingRecord.findMany({
      where,
      orderBy: {
        createdAt: sortOrder,
      },
    });

    return NextResponse.json({
      success: true,
      data: bets,
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
