import { db } from "@/lib/db";
import {
  adjustment,
  betPreserve,
  betPreserveRefund,
  bonus,
  cancelBet,
  freeBet,
  getTip,
  jackPot,
  leaderboardReward,
  placeBet,
  promo,
  rollback,
  settled,
} from "@/lib/gscAction";
import { accpectedCurrency, generateGSCPlatformSignature } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import pMap from "p-map";

export const POST = async (req: NextRequest) => {
  try {
    // ── 1. Parse body ──────────────────────────────────────────────────────────
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          code: 999,
          message: "Invalid JSON body",
          data: [
            {
              code: 999,
              message: "Invalid JSON body",
              member_account: "",
              product_code: null,
              before_balance: 0,
              balance: 0,
            },
          ],
        },
        { status: 200 },
      );
    }

    const {
      operator_code,
      currency,
      sign,
      request_time,
      batch_requests,
      // game_type at root level is optional per spec — we accept but don't require it
    } = body;

    // ── 2. Required field check ────────────────────────────────────────────────
    if (
      !operator_code ||
      !currency ||
      !sign ||
      !request_time ||
      !Array.isArray(batch_requests) ||
      batch_requests.length === 0
    ) {
      return NextResponse.json(
        {
          code: 999,
          message: "Invalid Parameters",
          data: [
            {
              code: 999,
              message: "Invalid Parameters",
              member_account: "",
              product_code: null,
              before_balance: 0,
              balance: 0,
            },
          ],
        },
        { status: 200 },
      );
    }

    // ── 3. Validate batch_requests structure ───────────────────────────────────
    // GSC+ example uses "Product_code" (capital P) in the request body,
    // so we accept both casings.
    const isNumeric = (value: unknown): boolean => {
      if (value === null || value === undefined || value === "") {
        return false;
      }

      return Number.isFinite(Number(value));
    };

    const isValidRequests = batch_requests.every((item: any) => {
      if (
        typeof item.member_account !== "string" ||
        item.member_account.trim() === "" ||
        !isNumeric(item.product_code ?? item.Product_code) ||
        typeof item.game_type !== "string" ||
        item.game_type.trim() === "" ||
        !Array.isArray(item.transactions) ||
        item.transactions.length === 0
      ) {
        return false;
      }

      return item.transactions.every((tx: any) => {
        return (
          typeof tx.id === "string" &&
          tx.id.trim() !== "" &&
          typeof tx.action === "string" &&
          tx.action.trim() !== "" &&
          isNumeric(tx.amount) &&
          isNumeric(tx.bet_amount) &&
          isNumeric(tx.prize_amount) &&
          isNumeric(tx.tip_amount) &&
          isNumeric(tx.valid_bet_amount) &&
          (tx.settled_at === undefined || isNumeric(tx.settled_at)) &&
          (tx.game_code === undefined || typeof tx.game_code === "string") &&
          (tx.round_id === undefined || typeof tx.round_id === "string") &&
          (tx.wager_code === undefined || typeof tx.wager_code === "string") &&
          (tx.wager_status === undefined ||
            typeof tx.wager_status === "string") &&
          (tx.payload === undefined ||
            (typeof tx.payload === "object" && tx.payload !== null))
        );
      });
    });

    if (!isValidRequests) {
      return NextResponse.json(
        {
          code: 999,
          message: "Invalid Parameters",
          data: [
            {
              code: 999,
              message: "Invalid Parameters",
              member_account: "",
              product_code: null,
              before_balance: 0,
              balance: 0,
            },
          ],
        },
        { status: 200 },
      );
    }

    if (!accpectedCurrency.includes(currency)) {
      return NextResponse.json(
        {
          code: 999,
          message: "Expect currency error",
          data: [
            {
              code: 999,
              message: "Expect currency error",
              member_account: "",
              product_code: null,
              before_balance: 0,
              balance: 0,
            },
          ],
        },
        {
          status: 200,
        },
      );
    }

    // ── 4. Env vars ────────────────────────────────────────────────────────────
    const MEMBER_OP_CODE = process.env.GSC_OPERATOR_CODE!;
    const SECRET_KEY = process.env.GSC_SECRET_KEY!;

    // Build a base responseData array we will mutate as we go.
    // product_code is normalised from either casing.
    let responseData = batch_requests.map((reqItem: any) => ({
      member_account: reqItem.member_account,
      product_code: reqItem.product_code ?? reqItem.Product_code,
      before_balance: 0,
      balance: 0,
      code: 0,
      message: "",
    }));

    // ── 5. Validate operator code ──────────────────────────────────────────────
    // Per spec code 1002 = "API proxy key error"
    if (operator_code !== MEMBER_OP_CODE) {
      return NextResponse.json(
        {
          code: 1002,
          message: "API proxy key error",
          data: responseData.map((entry: any) => ({
            ...entry,
            code: 1002,
            message: "API proxy key error",
          })),
        },
        { status: 200 },
      );
    }

    // ── 6. Validate signature ──────────────────────────────────────────────────
    // Sign formula: md5(operator_code + request_time + "withdraw" + secret_key)
    const platformSign = generateGSCPlatformSignature(
      request_time,
      SECRET_KEY,
      MEMBER_OP_CODE,
      "deposit",
    );

    if (platformSign !== sign) {
      return NextResponse.json(
        {
          code: 1004,
          message: "API signature is invalid",
          data: responseData.map((entry: any) => ({
            member_account: "...",
            product_code: 1006,
            code: 1004,
            message: "API signature is invalid",
          })),
        },
        { status: 200 },
      );
    }

    // ── 7. Validate currency ───────────────────────────────────────────────────
    // if (currency !== "BDT") {
    //   return NextResponse.json(
    //     {
    //       data: responseData.map((entry: any) => ({
    //         ...entry,
    //         code: 999,
    //         message: "Currency is not supported",
    //       })),
    //     },
    //     { status: 200 },
    //   );
    // }

    // ── 8. Process each batch item ─────────────────────────────────────────────
    responseData = await pMap(
      responseData,
      async (entry: any, i: number) => {
        const reqItem = batch_requests[i];
        const transactions: any[] = reqItem.transactions;
        const itemGameType: string = reqItem.game_type;

        // 8-a. Find user by phone (member_account maps to phone in your schema)
        const user = await db.users.findFirst({
          where: { playerId: entry.member_account },
          select: {
            id: true,
            wallet: { select: { balance: true } },
          },
        });

        if (!user) {
          return {
            ...entry,
            code: 1000,
            message: "API member does not exist",
          };
        }

        // 8-e. Process records per action type
        const txExecutions = (
          await pMap(transactions, async (tx: any) => {
            const action = tx.action?.toUpperCase();
            if (action === "BET") {
              const result = await placeBet({
                wagerCode: tx.wager_code,
                id: tx.id,
                amount: tx.amount,
                roundId: tx.round_id,
                name: tx.game_code,
                category: itemGameType,
                userId: user.id,
              });
              return result;
            } else if (action === "TIP") {
              const result = await getTip({
                amount: tx.amount,
                userId: user.id,
              });
              return result;
            } else if (action === "ROLLBACK") {
              const result = await rollback({
                id: tx.id,
                amount: tx.amount,
                userId: user.id,
                betAmount: tx.bet_amount,
              });
              return result;
            } else if (action === "ADJUSTMENT") {
              const result = await adjustment({
                userId: user.id,
                amount: tx.amount,
              });
              return result;
            } else if (action == "BET_PRESERVE") {
              const result = await betPreserve({
                userId: user.id,
                amount: tx.amount,
              });
              return result;
            } else if (action == "PRESERVE_REFUND") {
              const result = await betPreserveRefund({
                userId: user.id,
                amount: tx.amount,
              });
              return result;
            } else if (action == "SETTLED") {
              const result = await settled({
                userId: user.id,
                amount: tx.amount,
                betAmount: tx.bet_amount,
                id: tx.id,
                roundId: tx.round_id,
              });
              return result;
            } else if (action == "JACKPOT") {
              const result = await jackPot({
                userId: user.id,
                amount: tx.amount,
              });
              return result;
            } else if (action == "BONUS") {
              const result = await bonus({
                userId: user.id,
                amount: tx.amount,
              });
              return result;
            } else if (action == "PROMO") {
              const result = await promo({
                userId: user.id,
                amount: tx.amount,
              });
              return result;
            } else if (action == "LEADERBOARD") {
              const result = await leaderboardReward({
                userId: user.id,
                amount: tx.amount,
              });
              return result;
            } else if (action == "CANCEL") {
              const result = await cancelBet({
                userId: user.id,
                amount: tx.amount,
                id: tx.id,
                roundId: tx.round_id,
              });
              return result;
            } else if (action == "FREEBET") {
              const result = await freeBet({
                userId: user.id,
                amount: tx.amount,
              });
              return result;
            }

            return null;
          })
        ).filter(Boolean);
        console.log({ txExecutions });
        if (txExecutions.length == 0) {
          return {
            ...entry,
            code: 999,
            message: "Internal server error y",
            before_balance: 0,
            balance: 0,
          };
        }

        const failedTx: any[] = [];

        await db.$transaction(async (tx) => {
          let i = 0;

          while (i < txExecutions.length) {
            const result: any = txExecutions[i];

            if (!result.success) {
              failedTx.push(result);
              break;
            }

            const trxResult = await result.execute(tx);

            if (trxResult && !trxResult.success) {
              failedTx.push(trxResult);
              break;
            }

            i++;
          }
        });

        const updatedWallet = await db.wallet.findUnique({
          where: { userId: user.id },
          select: { balance: true },
        });

        if (failedTx.length > 0) {
          return {
            ...entry,
            code: failedTx[0].code,
            message: failedTx[0].message,
            before_balance: Number(user.wallet?.balance.toFixed(2)),
            balance: Number(updatedWallet?.balance.toFixed(2)),
          };
        }

        return {
          ...entry,
          code: 0,
          message: "",
          before_balance: Number(user.wallet?.balance.toFixed(2)),
          balance: Number(updatedWallet?.balance.toFixed(2)),
        };
      },
      { concurrency: 5 },
    );

    return NextResponse.json(
      { data: responseData, code: 0, message: "" },
      { status: 200 },
    );
  } catch (error) {
    console.error("ERROR ON WITHDRAW API", error);
    return NextResponse.json(
      {
        data: [
          {
            code: 999,
            message: "Internal server error x",
            member_account: "",
            product_code: null,
            before_balance: 0,
            balance: 0,
          },
        ],
      },
      { status: 200 },
    );
  }
};
