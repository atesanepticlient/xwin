/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

const USER_SECRET = process.env.GREGMORN_SECRET || "";

// Helper to standardize logging and response creation
function createAndLogResponse(body: Record<string, any>, status = 200) {
  console.log(
    `[API RESPONSE] Status: ${status} | Payload:`,
    JSON.stringify(body),
  );
  return Response.json(body, { status });
}

function verifySignature(
  rawTextToSign: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader || !USER_SECRET) {
    console.warn(
      "[AUTH] Verification failed: Missing x-signature header or GREGMORN_USER_SECRET env variable.",
    );
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", USER_SECRET)
    .update(Buffer.from(rawTextToSign, "utf8"))
    .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signatureHeader.trim().toLowerCase(), "utf8"),
    Buffer.from(expectedSignature.toLowerCase(), "utf8"),
  );

  if (!isValid) {
    console.warn(
      `[AUTH] Signature mismatch. Received: "${signatureHeader}", Expected: "${expectedSignature}"`,
    );
  }

  return isValid;
}

// Helper to safely extract roundId from the provider's info string or object
function parseRoundId(info: any): string | null {
  if (!info) return null;
  if (typeof info === "object") return info.roundId || info.round_id || null;
  try {
    const parsed = JSON.parse(info);
    return parsed.roundId || parsed.round_id || null;
  } catch (err) {
    console.warn("[PARSER] Failed to parse 'info' JSON string:", info, err);
    return null;
  }
}

// Shared Webhook Business Logic
async function handleWebhook(
  req: NextRequest,
  payload: Record<string, any>,
  rawTextToSign: string,
  method: string,
) {
  const reqTime = new Date().toISOString();
  console.log(
    `\n=== [${method} /api/webhook] Request Received at ${reqTime} ===`,
  );

  try {
    const signature =
      req.headers.get("x-signature") ||
      req.headers.get("X-Signature") ||
      req.nextUrl.searchParams.get("signature");

    if (!verifySignature(rawTextToSign, signature)) {
      console.error("[AUTH ERROR] Invalid HMAC signature.");
      return createAndLogResponse(
        {
          status: "fail",
          error: "invalid_signature",
          balance: 0,
          currency: "BDT",
          login: payload.login || "",
        },
        400,
      );
    }

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
      console.error(`[COMMAND ERROR] Unknown or unsupported command: '${cmd}'`);
      return createAndLogResponse(
        {
          status: "fail",
          error: "cmd_not_found",
          balance: 0,
          currency: "BDT",
          login: login || "",
        },
        400,
      );
    }

    // 1. Fetch User and Wallet
    const user = await db.users.findFirst({
      where: { playerId: login },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      console.error(
        `[USER ERROR] User or wallet not found for login: '${login}'`,
      );
      return createAndLogResponse(
        {
          status: "fail",
          error: "user_not_found",
          balance: 0,
          currency: "BDT",
          login: login || "",
        },
        400,
      );
    }

    const userCurrency = user.wallet.currencyCode || "BDT";
    const userBalance = new Decimal(user.wallet.balance);

    // --- COMMAND: getBalance ---
    if (cmd === "getBalance") {
      console.log(
        `[CMD: getBalance] Returning balance for user: ${user.playerId}`,
      );
      return createAndLogResponse({
        status: "success",
        error: "",
        login: user.playerId,
        balance: userBalance.toNumber(),
        currency: userCurrency,
      });
    }

    // Safe handling of string or number bet/win types from SL-Games & X-Games
    const bet =
      payload.bet !== undefined ? new Decimal(payload.bet) : new Decimal(0);
    const win =
      payload.win !== undefined ? new Decimal(payload.win) : new Decimal(0);
    const roundId = parseRoundId(info);

    // --- COMMAND: writeBet ---
    if (cmd === "writeBet") {
      // Idempotency Check: Return HTTP 200 with current balance if duplicate transactionId
      const existingTx = await db.bettingRecordSports.findUnique({
        where: { transactionId },
      });

      if (existingTx) {
        console.warn(
          `[IDEMPOTENCY] Duplicate transaction detected for transactionId: '${transactionId}'. Returning current balance.`,
        );
        return createAndLogResponse({
          status: "success",
          error: "",
          login: user.playerId,
          balance: userBalance.toNumber(),
          currency: userCurrency,
        });
      }

      // Check Insufficient Balance
      if (bet.gt(userBalance)) {
        console.error(
          `[BALANCE ERROR] Insufficient balance. Bet: ${bet.toString()}, Available: ${userBalance.toString()}`,
        );
        return createAndLogResponse(
          {
            status: "fail",
            error: "insufficient_balance",
            login: user.playerId,
            balance: userBalance.toNumber(),
            currency: userCurrency,
          },
          400,
        );
      }

      const netAmount = win.sub(bet);
      const newBalance = userBalance.add(netAmount);

      let txType: "BET" | "WIN" | "BET_WIN" = "BET";
      if (bet.gt(0) && win.gt(0)) txType = "BET_WIN";
      else if (win.gt(0)) txType = "WIN";

      await db.$transaction(async (tx) => {
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

        // Save Transaction Record
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

      return createAndLogResponse({
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

      // If missing or already cancelled, return current balance cleanly
      if (!existingTx || existingTx.status === "CANCELLED") {
        console.warn(
          `[CMD: rollback] Transaction '${transactionId}' ${!existingTx ? "not found" : "already CANCELLED"}. Skipping.`,
        );
        return createAndLogResponse({
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

        // Mark transaction as CANCELLED
        await tx.bettingRecordSports.update({
          where: { transactionId },
          data: {
            status: "CANCELLED",
            roundFinished: true,
          },
        });
      });

      return createAndLogResponse({
        status: "success",
        error: "",
        login: user.playerId,
        balance: refundedBalance.toNumber(),
        currency: userCurrency,
      });
    }
  } catch (error: any) {
    console.error(`[UNCAUGHT ERROR] Exception caught in API Handler:`, error);
    return createAndLogResponse(
      {
        status: "fail",
        error: error.message || "unexpected_error",
        balance: 0,
        currency: "BDT",
        login: "",
      },
      400,
    );
  }
}

// POST Route Export
export const POST = async (req: NextRequest) => {
  const rawBodyText = await req.text();
  let payload = {};
  try {
    payload = JSON.parse(rawBodyText || "{}");
  } catch {
    console.error("[PARSER ERROR] Failed to parse JSON body");
  }

  return handleWebhook(req, payload, rawBodyText, "POST");
};

// GET Route Export
export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const payload: Record<string, any> = {};

  searchParams.forEach((value, key) => {
    if (key !== "signature") {
      if (value === "true") payload[key] = true;
      else if (value === "false") payload[key] = false;
      else payload[key] = value;
    }
  });

  const rawTextToSign = Array.from(searchParams.entries())
    .filter(([key]) => key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return handleWebhook(req, payload, rawTextToSign, "GET");
};
