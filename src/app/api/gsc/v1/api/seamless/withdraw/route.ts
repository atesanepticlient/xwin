import { db } from "@/lib/db";
import {
  adjustment,
  betPreserve,
  betPreserveRefund,
  cancelBet,
  freeBet,
  getTip,
  placeBet,
  rollback,
} from "@/lib/gscAction";
import { accpectedCurrency, generateGSCPlatformSignature } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import pMap from "p-map";

/**
 * Per GSC+ API appendix "Currency Code":
 * Suffix "2" currencies (e.g. BDT2, IDR2, USD2, THB2...) are 1:1000
 * Suffix "3" currencies (e.g. IDR3, MMK3, MYR3, VND3) are 1:100
 * Everything else is 1:1
 *
 * "When the currency ratio is 1:1000 (or 1:100), operators are required to
 * perform the conversion themselves." Our wallet stores balances/amounts in
 * the BASE unit (ratio 1:1). GSC+ sends/expects amounts in the requested
 * `currency`'s scale, so:
 *   - incoming amounts (bet/tip/rollback/etc.)  -> multiply by ratio to get base units
 *   - outgoing balances (before_balance/balance) -> divide by ratio to get currency units
 */
function getCurrencyRatio(currency: string): number {
  if (/2$/.test(currency)) return 1000;
  if (/3$/.test(currency)) return 100;
  return 1;
}

function toBaseAmount(amount: number, ratio: number): number {
  return amount * ratio;
}

function toScaledBalance(rawBalance: number, ratio: number): number {
  return Number((rawBalance / ratio).toFixed(4));
}

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
    const isValidRequests = batch_requests.every((item: any) => {
      const productCode = Number(item.product_code ?? item.Product_code);

      if (
        typeof item.member_account !== "string" ||
        item.member_account.trim() === "" ||
        !Number.isFinite(productCode) ||
        typeof item.game_type !== "string" ||
        item.game_type.trim() === "" ||
        !Array.isArray(item.transactions) ||
        item.transactions.length === 0
      ) {
        return false;
      }

      return item.transactions.every((tx: any) => {
        const amount = Number(tx.amount);

        return (
          typeof tx.id === "string" &&
          tx.id.trim() !== "" &&
          typeof tx.action === "string" &&
          tx.action.trim() !== "" &&
          Number.isFinite(amount)
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
        {
          status: 200,
        },
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

    // Ratio for this request's currency — applied to every entry in the batch
    // since `currency` is a single root-level field, not per-item.
    const ratio = getCurrencyRatio(currency);

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
      "withdraw",
    );
    console.log({ platformSign, sign, request_time });
    if (platformSign !== sign) {
      return NextResponse.json(
        {
          code: 1004,
          message: "API signature is invalid",
          data: responseData.map((entry: any) => ({
            ...entry,
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
        // NOTE: amounts coming from GSC+ are expressed in the requested
        // `currency`'s scale (e.g. BDT2). Convert to base units (x ratio)
        // before applying to the wallet, which stores base-unit balances.
        const txExecutions = (
          await pMap(transactions, async (tx: any) => {
            const action = tx.action?.toUpperCase();
            const baseAmount = toBaseAmount(Number(tx.amount), ratio);
            if (action === "BET") {
              console.log({ amount: baseAmount });
              const result = await placeBet({
                wagerCode: tx.wager_code,
                id: tx.id,
                amount: baseAmount,
                roundId: tx.round_id,
                name: tx.game_code,
                category: itemGameType,
                userId: user.id,
              });
              console.log({ result });
              return result;
            } else if (action === "TIP") {
              const result = await getTip({
                amount: baseAmount,
                userId: user.id,
              });
              return result;
            } else if (action === "ROLLBACK") {
              const result = await rollback({
                id: tx.id,
                amount: baseAmount,
                userId: user.id,
                betAmount: toBaseAmount(Number(tx.bet_amount), ratio),
              });
              return result;
            } else if (action === "ADJUSTMENT") {
              const result = await adjustment({
                userId: user.id,
                amount: baseAmount,
              });
              return result;
            } else if (action == "BET_PRESERVE") {
              const result = await betPreserve({
                userId: user.id,
                amount: baseAmount,
              });
              return result;
            } else if (action == "PRESERVE_REFUND") {
              const result = await betPreserveRefund({
                userId: user.id,
                amount: baseAmount,
              });
              return result;
            } else if (action == "CANCEL") {
              const result = await cancelBet({
                userId: user.id,
                amount: baseAmount,
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
        if (txExecutions.length == 0) {
          return {
            ...entry,
            code: 999,
            message: "Internal server error",
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

        // Convert base-unit balances back to the requested currency's scale
        // (e.g. /1000 for BDT2) and report to the 4-decimal precision the
        // spec allows, instead of the previous toFixed(2).
        const beforeBalanceScaled = toScaledBalance(
          Number(user.wallet?.balance),
          ratio,
        );
        const balanceScaled = toScaledBalance(
          Number(updatedWallet?.balance),
          ratio,
        );

        if (failedTx.length > 0) {
          return {
            ...entry,
            code: failedTx[0].code,
            message: failedTx[0].message,
            before_balance: beforeBalanceScaled,
            balance: balanceScaled,
          };
        }

        return {
          ...entry,
          code: 0,
          message: "",
          before_balance: beforeBalanceScaled,
          balance: balanceScaled,
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
            message: "Internal server error",
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
