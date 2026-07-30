/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

const USER_SECRET = process.env.GREGMORN_USER_SECRET || "";

function verifySignature(
  rawBodyText: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader || !USER_SECRET) return false;

  const expectedSignature = crypto
    .createHmac("sha256", USER_SECRET)
    .update(Buffer.from(rawBodyText, "utf8"))
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader, "utf8"),
    Buffer.from(expectedSignature, "utf8"),
  );
}

// Helper to safely extract roundId from the provider's info JSON string
function parseRoundId(infoStr?: string): string | null {
  if (!infoStr) return null;
  try {
    const parsed = JSON.parse(infoStr);
    return parsed.roundId || parsed.round_id || null;
  } catch {
    return null;
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const rawBodyText = await req.text();
    const signature = req.headers.get("x-signature");

    if (!verifySignature(rawBodyText, signature)) {
      return Response.json(
        {
          status: "fail",
          error: "invalid_signature",
          balance: 0,
          currency: "BDT",
          login: "",
        },
        { status: 400 },
      );
    }

    const payload = JSON.parse(rawBodyText);
    const {
      cmd,
      login,
      sessionid,
      transactionId,
      gameId,
      info,
      round_finished,
    } = payload;

    if (!["getBalance", "writeBet", "rollback"].includes(cmd)) {
      return Response.json(
        {
          status: "fail",
          error: "cmd_not_found",
          balance: 0,
          currency: "BDT",
          login: login || "",
        },
        { status: 400 },
      );
    }

    // 1. Fetch User and Wallet
    const user = await db.users.findFirst({
      where: { playerId: login },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return Response.json(
        {
          status: "fail",
          error: "user_not_found",
          balance: 0,
          currency: "BDT",
          login: login || "",
        },
        { status: 400 },
      );
    }

    const userCurrency = user.wallet.currencyCode || "BDT";
    const userBalance = new Decimal(user.wallet.balance);

    // --- COMMAND: getBalance ---
    if (cmd === "getBalance") {
      return Response.json({
        status: "success",
        error: "",
        login: user.playerId,
        balance: userBalance.toNumber(),
        currency: userCurrency,
      });
    }

    const bet =
      payload.bet !== undefined ? new Decimal(payload.bet) : new Decimal(0);
    const win =
      payload.win !== undefined ? new Decimal(payload.win) : new Decimal(0);
    const roundId = parseRoundId(info);

    // --- COMMAND: writeBet ---
    if (cmd === "writeBet") {
      // Idempotency Check: Return existing balance if duplicate transactionId
      const existingTx = await db.bettingRecordSports.findUnique({
        where: { transactionId },
      });

      if (existingTx) {
        return Response.json({
          status: "success",
          error: "",
          login: user.playerId,
          balance: userBalance.toNumber(),
          currency: userCurrency,
        });
      }

      // Check Insufficient Funds
      if (bet.gt(userBalance)) {
        return Response.json(
          {
            status: "fail",
            error: "insufficient_balance",
            login: user.playerId,
            balance: userBalance.toNumber(),
            currency: userCurrency,
          },
          { status: 400 },
        );
      }

      // Calculate Net Balance Change
      const netAmount = win.sub(bet);
      const newBalance = userBalance.add(netAmount);

      // Determine Transaction Type
      let txType: "BET" | "WIN" | "BET_WIN" = "BET";
      if (bet.gt(0) && win.gt(0)) txType = "BET_WIN";
      else if (win.gt(0)) txType = "WIN";

      await db.$transaction(async (tx) => {
        // Ensure GameSession exists or create it
        if (sessionid) {
          await tx.sportsGameSession.upsert({
            where: { sessionId: sessionid },
            update: { gameId: gameId || undefined },
            create: {
              sessionId: sessionid,
              userId: user.id,
              gameId: gameId || null,
              currency: userCurrency,
            },
          });
        }

        // Update Wallet Balance
        await tx.wallet.update({
          where: { userId: user.id },
          data: { balance: newBalance },
        });

        // Create Betting Record
        await tx.bettingRecordSports.create({
          data: {
            transactionId,
            sessionId: sessionid || null,
            userId: user.id,
            gameId: gameId || null,
            roundId,
            txType,
            betAmount: bet,
            winAmount: win,
            netAmount,
            status: round_finished ? "SETTLED" : "RUNNING",
            roundFinished: Boolean(round_finished),
            rawInfo:
              typeof info === "string" ? info : JSON.stringify(info || {}),
          },
        });
      });

      return Response.json({
        status: "success",
        error: "",
        login: user.playerId,
        balance: newBalance.toNumber(),
        currency: userCurrency,
      });
    }

    // --- COMMAND: rollback ---
    if (cmd === "rollback") {
      const existingTx = await db.bettingRecordSports.findUnique({
        where: { transactionId },
      });

      // If missing or already cancelled, safely return current balance
      if (!existingTx || existingTx.status === "CANCELLED") {
        return Response.json({
          status: "success",
          error: "",
          login: user.playerId,
          balance: userBalance.toNumber(),
          currency: userCurrency,
        });
      }

      // Refund the original bet amount
      const refundedBalance = userBalance.add(existingTx.betAmount);

      await db.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { userId: user.id },
          data: { balance: refundedBalance },
        });

        // Mark existing record as CANCELLED and log rollback details
        await tx.bettingRecordSports.update({
          where: { transactionId },
          data: {
            status: "CANCELLED",
            roundFinished: true,
          },
        });

        // Optionally create a audit trail entry for rollback
        await tx.bettingRecordSports.create({
          data: {
            transactionId: `rb_${transactionId}`,
            sessionId: sessionid || null,
            userId: user.id,
            gameId: gameId || existingTx.gameId,
            roundId: roundId || existingTx.roundId,
            txType: "ROLLBACK",
            betAmount: existingTx.betAmount,
            winAmount: new Decimal(0),
            netAmount: existingTx.betAmount,
            status: "SETTLED",
            roundFinished: true,
            rawInfo:
              typeof info === "string" ? info : JSON.stringify(info || {}),
          },
        });
      });

      return Response.json({
        status: "success",
        error: "",
        login: user.playerId,
        balance: refundedBalance.toNumber(),
        currency: userCurrency,
      });
    }
  } catch (error: any) {
    return Response.json(
      {
        status: "fail",
        error: error.message || "unexpected_error",
        balance: 0,
        currency: "BDT",
        login: "",
      },
      { status: 400 },
    );
  }
};
