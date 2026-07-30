import { db } from "@/lib/db";

import { generateGSCPlatformSignature } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          code: 999,
          message: "Invalid JSON body",
        },
        { status: 200 },
      );
    }

    const {
      operator_code,
      wagers,
      sign,
      request_time,

      // game_type at root level is optional per spec — we accept but don't require it
    } = body;

    if (
      !operator_code ||
      !sign ||
      !request_time ||
      !Array.isArray(wagers) ||
      wagers.length === 0
    ) {
      return NextResponse.json(
        {
          code: 999,
          message: "Invalid Parameters",
        },
        { status: 200 },
      );
    }

    const isValidRequests =
      Array.isArray(wagers) &&
      wagers.length > 0 &&
      wagers.every((wager: any) => {
        return (
          typeof wager.member_account === "string" &&
          wager.member_account.trim() !== "" &&
          (typeof wager.product_code === "string" ||
            typeof wager.product_code === "number") &&
          typeof wager.game_type === "string" &&
          wager.game_type.trim() !== "" &&
          typeof wager.round_id === "string" &&
          wager.round_id.trim() !== "" &&
          typeof wager.wager_status === "string" &&
          wager.wager_status.trim() !== "" &&
          typeof wager.wager_code === "string" &&
          wager.wager_code.trim() !== "" &&
          typeof wager.wager_type === "string" &&
          wager.wager_type.trim() !== "" &&
          (typeof wager.prize_amount === "string" ||
            typeof wager.prize_amount === "number") &&
          (typeof wager.bet_amount === "string" ||
            typeof wager.bet_amount === "number") &&
          (typeof wager.valid_bet_amount === "string" ||
            typeof wager.valid_bet_amount === "number")
        );
      });

    if (!isValidRequests) {
      return NextResponse.json(
        {
          code: 999,
          message: "Invalid Parameters",
        },
        {
          status: 200,
        },
      );
    }

    const MEMBER_OP_CODE = process.env.GSC_OPERATOR_CODE!;
    const SECRET_KEY = process.env.GSC_SECRET_KEY!;

    const platformSign = generateGSCPlatformSignature(
      request_time,
      SECRET_KEY,
      MEMBER_OP_CODE,
      "pushbetdata",
    );

    if (platformSign !== sign) {
      return NextResponse.json(
        {
          code: 1004,
          message: "API signature is invalid",
        },
        { status: 200 },
      );
    }

    const settledBets = wagers.filter((wager) => {
      const status =
        wager.wager_status.toUpperCase() || wager.status.toUpperCase();
      console.log({ status });
      return status == "SETTLED" || status == "RESETTLED";
    });

    const bonusdBets = wagers.filter((wager) => {
      const status =
        wager.wager_status.toUpperCase() || wager.status.toUpperCase();
      return status == "BONUS";
    });

    const voidBets = wagers.filter((wager) => {
      const status =
        wager.wager_status.toUpperCase() || wager.status.toUpperCase();
      return status == "VOID ";
    });

    const wagersMembersId = wagers.map((w) => w.member_account);

    const usersFound = await db.users.findMany({
      where: {
        playerId: { in: [...wagersMembersId] },
      },
    });

    if (usersFound.length == 0) {
      return NextResponse.json(
        {
          code: 1000,
          message: "API member does not exist",
        },
        { status: 200 },
      );
    }

    await db.$transaction(async (tx) => {
      await Promise.all([
        ...settledBets.map((wager) =>
          tx.bettingRecord.updateMany({
            where: {
              wagerCode: wager.wager_code,
            },
            data: {
              status: "SETTLED",
              profit: wager.prize_amount > 0 ? wager.prize_amount : 0,
              loss: wager.prize_amount > 0 ? 0 : wager.bet_amount,
            },
          }),
        ),

        ...bonusdBets.map((wager) =>
          tx.bettingRecord.updateMany({
            where: {
              wagerCode: wager.wager_code,
              roundId: wager.round_id,
            },
            data: {
              profit: {
                increment: wager.prize_amount,
              },
            },
          }),
        ),

        ...voidBets.map((wager) =>
          tx.bettingRecord.updateMany({
            where: {
              wagerCode: wager.wager_code,
            },
            data: {
              status: "VOID",
            },
          }),
        ),
      ]);
    });

    return NextResponse.json({ code: 0, message: "" }, { status: 200 });
  } catch (error) {
    console.error("ERROR ON WITHDRAW API", error);
    return NextResponse.json(
      {
        code: 999,
        message: "Internal server error",
      },
      { status: 200 },
    );
  }
};
