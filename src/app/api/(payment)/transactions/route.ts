import { NextRequest, NextResponse } from "next/server";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { PaymentStatus, WalletCategory, Prisma } from "@prisma/client";

type TxKind = "DEPOSIT" | "WITHDRAW";

interface TransactionItem {
  id: string;
  kind: TxKind;
  amount: number;
  status: PaymentStatus;
  merchantId: string;
  method: WalletCategory | null;
  walletName: string | null;
  reference: string | null; // payFrom for deposit, paymentWalletNumber for withdraw
  createdAt: string;
}

const toNumber = (v: Prisma.Decimal | number | null | undefined) =>
  v == null ? 0 : Number(v);

export async function GET(req: NextRequest) {
  try {
    const user = await findCurrentUser();
    if (!user)
      return NextResponse.json(
        { error: "Authentication error!" },
        { status: 401 },
      );

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "all"; // all | deposit | withdraw
    const status = searchParams.get("status") ?? "all"; // all | PENDING | ACCEPTED | REJECTED
    const method = searchParams.get("method") ?? "all"; // all | MOBILE_BANKING | CRYPTO
    const from = searchParams.get("from"); // ISO date
    const to = searchParams.get("to"); // ISO date
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(5, Number(searchParams.get("limit")) || 15),
    );

    const dateWhere: Prisma.DepositWhereInput["createdAt"] = {};
    if (from) dateWhere.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateWhere.lte = toDate;
    }
    const hasDateFilter = Boolean(from || to);

    const statusFilter =
      status !== "all" &&
      Object.values(PaymentStatus).includes(status as PaymentStatus)
        ? (status as PaymentStatus)
        : undefined;

    const methodFilter =
      method !== "all" &&
      Object.values(WalletCategory).includes(method as WalletCategory)
        ? (method as WalletCategory)
        : undefined;

    // Fetch enough rows from each side to safely cover the requested page
    // after merging + sorting. Not a true DB-level cursor across two tables —
    // fine at this scale, worth revisiting with a unified ledger table later
    // if transaction volume grows large.
    const fetchTake = page * limit + limit;

    const depositWhere: Prisma.DepositWhereInput = {
      userId: user.id,
      ...(statusFilter && { status: statusFilter }),
      ...(hasDateFilter && { createdAt: dateWhere }),
      ...(methodFilter && { ewallet: { category: methodFilter } }),
      ...(search && {
        OR: [
          { merchantId: { contains: search, mode: "insensitive" } },
          { payFrom: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const withdrawWhere: Prisma.WithdrawWhereInput = {
      userId: user.id,
      ...(statusFilter && { status: statusFilter }),
      ...(hasDateFilter && { createdAt: dateWhere }),
      ...(methodFilter && { withdrawEWallet: { category: methodFilter } }),
      ...(search && {
        OR: [
          { merchantId: { contains: search, mode: "insensitive" } },
          { paymentWalletNumber: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [deposits, withdraws] = await Promise.all([
      type === "withdraw"
        ? []
        : db.deposit.findMany({
            where: depositWhere,
            orderBy: { createdAt: "desc" },
            take: fetchTake,
            include: {
              ewallet: { select: { walletName: true, category: true } },
            },
          }),
      type === "deposit"
        ? []
        : db.withdraw.findMany({
            where: withdrawWhere,
            orderBy: { createdAt: "desc" },
            take: fetchTake,
            include: {
              withdrawEWallet: { select: { walletName: true, category: true } },
            },
          }),
    ]);
console.log({deposits})
    const merged: TransactionItem[] = [
      ...deposits.map((d) => ({
        id: d.id,
        kind: "DEPOSIT" as TxKind,
        amount: toNumber(d.amount),
        status: d.status,
        merchantId: d.merchantId,
        method: d.ewallet?.category ?? null,
        walletName: d.ewallet?.walletName ?? null,
        reference: d.payFrom,
        createdAt: d.createdAt.toISOString(),
      })),
      ...withdraws.map((w) => ({
        id: w.id,
        kind: "WITHDRAW" as TxKind,
        amount: toNumber(w.amount),
        status: w.status,
        merchantId: w.merchantId,
        method: w.withdrawEWallet?.category ?? null,
        walletName: w.withdrawEWallet?.walletName ?? null,
        reference: w.paymentWalletNumber,
        createdAt: w.createdAt.toISOString(),
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const start = (page - 1) * limit;
    const pageItems = merged.slice(start, start + limit);
    const hasMore = merged.length > start + limit;

    // ---- Stats: scoped by date range/search/method, NOT by status or type,
    // so the summary bar always shows the full pending/accepted/rejected
    // breakdown for whatever the user is currently filtering by date/search.
    const [depositStats, withdrawStats] = await Promise.all([
      db.deposit.groupBy({
        by: ["status"],
        where: {
          userId: user.id,
          ...(hasDateFilter && { createdAt: dateWhere }),
          ...(methodFilter && { ewallet: { category: methodFilter } }),
          ...(search && {
            OR: [
              { merchantId: { contains: search, mode: "insensitive" } },
              { payFrom: { contains: search, mode: "insensitive" } },
            ],
          }),
        },
        _sum: { amount: true },
        _count: true,
      }),
      db.withdraw.groupBy({
        by: ["status"],
        where: {
          userId: user.id,
          ...(hasDateFilter && { createdAt: dateWhere }),
          ...(methodFilter && { withdrawEWallet: { category: methodFilter } }),
          ...(search && {
            OR: [
              { merchantId: { contains: search, mode: "insensitive" } },
              {
                paymentWalletNumber: { contains: search, mode: "insensitive" },
              },
            ],
          }),
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const emptyBreakdown = { PENDING: 0, ACCEPTED: 0, REJECTED: 0 };
    const buildBreakdown = (rows: typeof depositStats) => {
      const counts = { ...emptyBreakdown };
      let total = 0;
      let totalAmount = 0;
      for (const r of rows) {
        counts[r.status] = r._count;
        total += r._count;
        totalAmount += toNumber(r._sum.amount);
      }
      return { counts, total, totalAmount };
    };

    const depositBreakdown = buildBreakdown(depositStats);
    const withdrawBreakdown = buildBreakdown(withdrawStats);

    return NextResponse.json({
      items: pageItems,
      page,
      limit,
      hasMore,
      stats: {
        deposit: depositBreakdown,
        withdraw: withdrawBreakdown,
        pendingCount:
          depositBreakdown.counts.PENDING + withdrawBreakdown.counts.PENDING,
      },
    });
  } catch (error) {
    console.error("Transaction history error:", error);
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
