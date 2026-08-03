import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const authUser = await findCurrentUser();

    const user = await db.users.findUnique({ where: { id: authUser!.id } });

    if (!user)
      return NextResponse.json(
        { error: "Authentication failed!" },
        { status: 401 },
      );

    let profileStatus = null;
    let scurityStatus = null;

    let unSeenMessage = false;
    let claimableCashback = false;
    let depositNofication = false;
    let withdrawalNofication = false;

    if (!user.email && !user.phone) {
      profileStatus = "HIGH_RISK";
      scurityStatus = "WARNING";
    } else if (!(user.email && user.phone)) {
      profileStatus = "WARNING";
    }

    const message = await db.message.count({
      where: { userId: user.id, seen: false },
    });
    unSeenMessage = message > 0;

    const cashbacks = await db.cashback.count({
      where: { userId: user.id, claimable: true },
    });
    claimableCashback = cashbacks > 0;

    const deposit = await db.deposit.count({
      where: {
        userId: user.id,
        status: "ACCEPTED",
        userNotifyStatus: "UNSEEN",
      },
    });
    depositNofication = deposit > 0;

    const withdraw = await db.withdraw.count({
      where: {
        userId: user.id,
        status: "ACCEPTED",
        userNotifyStatus: "UNSEEN",
      },
    });
    withdrawalNofication = withdraw > 0;

    return NextResponse.json(
      {
        payload: {
          profileStatus,
          scurityStatus,
          unSeenMessage,
          claimableCashback,
          depositNofication,
          withdrawalNofication,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.log({ error });
    return NextResponse.json(
      { error: "Notification fatch failed!" },
      { status: 500 },
    );
  }
};
