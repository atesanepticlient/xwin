import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// 1. Mark functions with clear naming and await Prisma calls
const processMessage = async (userId: string) => {
  await db.message.updateMany({
    where: { userId, seen: false }, // Only update unseen to optimize writes
    data: { seen: true },
  });
};

const processDeposit = async (userId: string) => {
  await db.deposit.updateMany({
    where: { userId, userNotifyStatus: "UNSEEN" },
    data: { userNotifyStatus: "SEEN" },
  });
};

const processWithdrawal = async (userId: string) => {
  await db.withdraw.updateMany({
    where: { userId, userNotifyStatus: "UNSEEN" },
    data: { userNotifyStatus: "SEEN" },
  });
};

export const POST = async (req: NextRequest) => {
  try {
    const userAuth = await findCurrentUser();
    if (!userAuth?.id) {
      return NextResponse.json(
        { error: "Authentication failed!" },
        { status: 401 },
      );
    }

    const user = await db.users.findUnique({ where: { id: userAuth.id } });
    if (!user) {
      return NextResponse.json(
        { error: "Authentication failed!" },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => null);
    const proccessQueue = body?.proccessQueue as Array<
      "DEPOSIT" | "WITHDRAW" | "MESSAGE"
    >;

    if (!Array.isArray(proccessQueue) || proccessQueue.length === 0) {
      return NextResponse.json(
        { error: "Invalid process queue" },
        { status: 400 },
      );
    }

    // 2. Use Promise.all / await so all DB operations finish before responding
    const tasks: Promise<void>[] = [];

    if (proccessQueue.includes("DEPOSIT")) {
      tasks.push(processDeposit(user.id));
    }
    if (proccessQueue.includes("WITHDRAW")) {
      tasks.push(processWithdrawal(user.id));
    }
    if (proccessQueue.includes("MESSAGE")) {
      tasks.push(processMessage(user.id));
    }

    await Promise.all(tasks);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
