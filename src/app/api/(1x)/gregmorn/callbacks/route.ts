/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

const USER_SECRET = process.env.GREGMORN_USER_SECRET || "";

// Helper to standardise logging and response creation
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
      "[AUTH] Verification failed: Missing signature header or USER_SECRET env variable.",
    );
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", USER_SECRET)
    .update(Buffer.from(rawTextToSign, "utf8"))
    .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signatureHeader, "utf8"),
    Buffer.from(expectedSignature, "utf8"),
  );

  if (!isValid) {
    console.warn(
      `[AUTH] Signature mismatch. Received: "${signatureHeader}", Expected: "${expectedSignature}"`,
    );
  }

  return isValid;
}

// Helper to safely extract roundId from the provider's info JSON string
function parseRoundId(infoStr?: string): string | null {
  if (!infoStr) return null;
  try {
    const parsed = typeof infoStr === "string" ? JSON.parse(infoStr) : infoStr;
    return parsed.roundId || parsed.round_id || null;
  } catch (err) {
    console.warn("[PARSER] Failed to parse 'info' JSON string:", infoStr, err);
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
      req.nextUrl.searchParams.get("signature");

    console.log(`[REQUEST HEADERS/QUERY] signature: ${signature}`);
    console.log(`[PAYLOAD DATA]`, payload);

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

    console.log(
      `[PARSED PAYLOAD] Command: '${cmd}' | Login: '${login}' | TxID: '${transactionId}' | SessionID: '${sessionid}'`,
    );

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
    console.log(`[DB SEARCH] Fetching user for playerId: '${login}'`);
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

    console.log(
      `[USER FOUND] User ID: ${user.id} | Current Balance: ${userBalance.toString()} ${userCurrency}`,
    );

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

    const bet =
      payload.bet !== undefined ? new Decimal(payload.bet) : new Decimal(0);
    const win =
      payload.win !== undefined ? new Decimal(payload.win) : new Decimal(0);
    const roundId = parseRoundId(info);

    console.log(
      `[TRANSACTION DATA] Bet: ${bet.toString()} | Win: ${win.toString()} | Round ID: ${roundId}`,
    );

    // --- COMMAND: writeBet ---
    if (cmd === "writeBet") {
      console.log(
        `[CMD: writeBet] Checking idempotency for transactionId: '${transactionId}'`,
      );

      const existingTx = await db.bettingRecordSports.findUnique({
        where: { transactionId },
      });

      if (existingTx) {
        console.warn(
          `[IDEMPOTENCY] Duplicate transaction detected for transactionId: '${transactionId}'. Skipping process.`,
        );
        return createAndLogResponse({
          status: "success",
          error: "",
          login: user.playerId,
          balance: userBalance.toNumber(),
          currency: userCurrency,
        });
      }

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

      console.log(
        `[CMD: writeBet] Calculated Net Change: ${netAmount.toString()} | New Balance: ${newBalance.toString()} | TxType: ${txType}`,
      );

      await db.$transaction(async (tx) => {
        if (sessionid) {
          console.log(
            `[DB TRANSACTION] Upserting SportsGameSession: '${sessionid}'`,
          );
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

        console.log(
          `[DB TRANSACTION] Updating balance for User ID: ${user.id} -> ${newBalance.toString()}`,
        );
        await tx.wallet.update({
          where: { userId: user.id },
          data: { balance: newBalance },
        });

        console.log(
          `[DB TRANSACTION] Creating BettingRecordSports for TxID: '${transactionId}'`,
        );
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

      console.log(`[CMD: writeBet] Transaction processed successfully.`);
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
      console.log(
        `[CMD: rollback] Fetching transaction record for rollback TxID: '${transactionId}'`,
      );

      const existingTx = await db.bettingRecordSports.findUnique({
        where: { transactionId },
      });

      if (!existingTx || existingTx.status === "CANCELLED") {
        console.warn(
          `[CMD: rollback] Transaction '${transactionId}' ${!existingTx ? "not found" : "already CANCELLED"}. No changes made.`,
        );
        return createAndLogResponse({
          status: "success",
          error: "",
          login: user.playerId,
          balance: userBalance.toNumber(),
          currency: userCurrency,
        });
      }

      const refundedBalance = userBalance.add(existingTx.betAmount);
      console.log(
        `[CMD: rollback] Refunding bet amount: ${existingTx.betAmount.toString()} | New Balance: ${refundedBalance.toString()}`,
      );

      await db.$transaction(async (tx) => {
        console.log(`[DB TRANSACTION] Refunding user wallet ID: ${user.id}`);
        await tx.wallet.update({
          where: { userId: user.id },
          data: { balance: refundedBalance },
        });

        console.log(
          `[DB TRANSACTION] Updating transaction '${transactionId}' status to CANCELLED`,
        );
        await tx.bettingRecordSports.update({
          where: { transactionId },
          data: {
            status: "CANCELLED",
            roundFinished: true,
          },
        });

        const auditTxId = `rb_${transactionId}`;
        console.log(
          `[DB TRANSACTION] Creating rollback audit record with TxID: '${auditTxId}'`,
        );
        await tx.bettingRecordSports.create({
          data: {
            transactionId: auditTxId,
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

      console.log(`[CMD: rollback] Rollback completed successfully.`);
      return createAndLogResponse({
        status: "success",
        error: "",
        login: refundedBalance.toNumber(),
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

  // Convert URL SearchParams into standard payload object
  searchParams.forEach((value, key) => {
    if (key !== "signature") {
      if (value === "true") payload[key] = true;
      else if (value === "false") payload[key] = false;
      else payload[key] = value;
    }
  });

  // Re-build canonical query string for HMAC verification if needed
  const rawTextToSign = Array.from(searchParams.entries())
    .filter(([key]) => key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return handleWebhook(req, payload, rawTextToSign, "GET");
};
