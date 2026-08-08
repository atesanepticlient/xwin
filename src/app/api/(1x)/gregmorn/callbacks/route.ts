// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextRequest } from "next/server";
// import crypto from "crypto";
// import { db } from "@/lib/db";
// import { Decimal } from "@prisma/client/runtime/library";

// const USER_SECRET = process.env.GREGMORN_SECRET || "";

// // Helper to standardize logging and response creation
// function createAndLogResponse(body: Record<string, any>, status = 200) {
//   console.log(
//     `[API RESPONSE] Status: ${status} | Payload:`,
//     JSON.stringify(body),
//   );
//   return Response.json(body, { status });
// }

// function verifySignature(
//   rawTextToSign: string,
//   signatureHeader: string | null,
// ): boolean {
//   if (!signatureHeader || !USER_SECRET) {
//     console.warn(
//       "[AUTH] Verification failed: Missing x-signature header or GREGMORN_USER_SECRET env variable.",
//     );
//     return false;
//   }

//   const expectedSignature = crypto
//     .createHmac("sha256", USER_SECRET)
//     .update(Buffer.from(rawTextToSign, "utf8"))
//     .digest("hex");

//   const isValid = crypto.timingSafeEqual(
//     Buffer.from(signatureHeader.trim().toLowerCase(), "utf8"),
//     Buffer.from(expectedSignature.toLowerCase(), "utf8"),
//   );

//   if (!isValid) {
//     console.warn(
//       `[AUTH] Signature mismatch. Received: "${signatureHeader}", Expected: "${expectedSignature}"`,
//     );
//   }

//   return isValid;
// }

// // Helper to safely extract roundId from the provider's info string or object
// function parseRoundId(info: any): string | null {
//   if (!info) return null;
//   if (typeof info === "object") return info.roundId || info.round_id || null;
//   try {
//     const parsed = JSON.parse(info);
//     return parsed.roundId || parsed.round_id || null;
//   } catch (err) {
//     console.warn("[PARSER] Failed to parse 'info' JSON string:", info, err);
//     return null;
//   }
// }

// // Shared Webhook Business Logic
// async function handleWebhook(
//   req: NextRequest,
//   payload: Record<string, any>,
//   rawTextToSign: string,
//   method: string,
// ) {
//   const reqTime = new Date().toISOString();
//   console.log(
//     `\n=== [${method} /api/webhook] Request Received at ${reqTime} ===`,
//   );

//   // FIX: Added `id: true` to the select block so `user.id` is defined
//   const user = await db.users.findUnique({
//     where: { playerId: payload.login },
//     select: { id: true, wallet: true, playerId: true },
//   });

//   if (!user || !user.wallet || !user.wallet.currencyCode)
//     return createAndLogResponse(
//       {
//         status: "fail",
//         error: "user_not_found",
//         balance: 0,
//         currency: "",
//         login: payload.login || "",
//       },
//       400,
//     );

//   const currency = user.wallet.currencyCode;

//   try {
//     const signature =
//       req.headers.get("x-signature") ||
//       req.headers.get("X-Signature") ||
//       req.nextUrl.searchParams.get("signature");

//     if (!verifySignature(rawTextToSign, signature)) {
//       console.error("[AUTH ERROR] Invalid HMAC signature.");
//       return createAndLogResponse(
//         {
//           status: "fail",
//           error: "invalid_signature",
//           balance: 0,
//           currency: currency,
//           login: payload.login || "",
//         },
//         400,
//       );
//     }

//     const {
//       cmd,
//       login,
//       sessionid,
//       transactionId,
//       gameId,
//       info,
//       round_finished,
//     } = payload;

//     console.log({
//       cmd,
//       login,
//       sessionid,
//       transactionId,
//       gameId,
//       info,
//       round_finished,
//     });

//     if (!["getBalance", "writeBet", "rollback"].includes(cmd)) {
//       console.error(`[COMMAND ERROR] Unknown or unsupported command: '${cmd}'`);
//       return createAndLogResponse(
//         {
//           status: "fail",
//           error: "cmd_not_found",
//           balance: 0,
//           currency: currency,
//           login: login || "",
//         },
//         400,
//       );
//     }

//     const userBalance = new Decimal(user.wallet.balance);

//     // --- COMMAND: getBalance ---
//     if (cmd === "getBalance") {
//       console.log(
//         `[CMD: getBalance] Returning balance for user: ${user.playerId}`,
//       );
//       return createAndLogResponse({
//         status: "success",
//         error: "",
//         login: user.playerId,
//         balance: userBalance.toNumber(),
//         currency: currency,
//       });
//     }

//     // Safe handling of string or number bet/win types from SL-Games & X-Games
//     const bet =
//       payload.bet !== undefined ? new Decimal(payload.bet) : new Decimal(0);
//     const win =
//       payload.win !== undefined ? new Decimal(payload.win) : new Decimal(0);
//     const roundId = parseRoundId(info);

//     // --- COMMAND: writeBet ---
//     if (cmd === "writeBet") {
//       // Idempotency Check: Return HTTP 200 with current balance if duplicate transactionId
//       const existingTx = await db.bettingRecordSports.findUnique({
//         where: { transactionId },
//       });

//       if (existingTx) {
//         console.warn(
//           `[IDEMPOTENCY] Duplicate transaction detected for transactionId: '${transactionId}'. Returning current balance.`,
//         );
//         return createAndLogResponse({
//           status: "success",
//           error: "",
//           login: user.playerId,
//           balance: userBalance.toNumber(),
//           currency: currency,
//         });
//       }

//       // Check Insufficient Balance
//       if (bet.gt(userBalance)) {
//         console.error(
//           `[BALANCE ERROR] Insufficient balance. Bet: ${bet.toString()}, Available: ${userBalance.toString()}`,
//         );
//         return createAndLogResponse(
//           {
//             status: "fail",
//             error: "insufficient_balance",
//             login: user.playerId,
//             balance: userBalance.toNumber(),
//             currency: currency,
//           },
//           400,
//         );
//       }

//       const netAmount = win.sub(bet);
//       const newBalance = userBalance.add(netAmount);

//       let txType: "BET" | "WIN" | "BET_WIN" = "BET";
//       if (bet.gt(0) && win.gt(0)) txType = "BET_WIN";
//       else if (win.gt(0)) txType = "WIN";

//       // FIX: Removed manual inline type signatures on `tx` so Prisma dynamically types it
//       await db.$transaction(async (tx) => {
//         if (sessionid) {
//           await tx.sportsGameSession.upsert({
//             where: { sessionId: sessionid },
//             update: { gameId: gameId || undefined },
//             create: {
//               sessionId: sessionid,
//               userId: user.id,
//               gameId: gameId || null,
//               currency: currency,
//             },
//           });
//         }

//         // Update Wallet Balance
//         await tx.wallet.update({
//           where: { userId: user.id },
//           data: { balance: newBalance },
//         });

//         // Save Transaction Record
//         await tx.bettingRecordSports.create({
//           data: {
//             transactionId,
//             sessionId: sessionid || null,
//             userId: user.id,
//             gameId: gameId || null,
//             roundId,
//             txType,
//             betAmount: bet,
//             winAmount: win,
//             netAmount,
//             status: round_finished ? "SETTLED" : "RUNNING",
//             roundFinished: Boolean(round_finished),
//             rawInfo:
//               typeof info === "string" ? info : JSON.stringify(info || {}),
//           },
//         });
//       });

//       return createAndLogResponse({
//         status: "success",
//         error: "",
//         login: user.playerId,
//         balance: newBalance.toNumber(),
//         currency: currency,
//       });
//     }

//     // --- COMMAND: rollback ---
//     if (cmd === "rollback") {
//       const existingTx = await db.bettingRecordSports.findUnique({
//         where: { transactionId },
//       });

//       // If missing or already cancelled, return current balance cleanly
//       if (!existingTx || existingTx.status === "CANCELLED") {
//         console.warn(
//           `[CMD: rollback] Transaction '${transactionId}' ${!existingTx ? "not found" : "already CANCELLED"}. Skipping.`,
//         );
//         return createAndLogResponse({
//           status: "success",
//           error: "",
//           login: user.playerId,
//           balance: userBalance.toNumber(),
//           currency: currency,
//         });
//       }

//       // Refund the original bet amount
//       const refundedBalance = userBalance.add(existingTx.betAmount);

//       // FIX: Removed manual inline type signatures on `tx`
//       await db.$transaction(async (tx) => {
//         await tx.wallet.update({
//           where: { userId: user.id },
//           data: { balance: refundedBalance },
//         });

//         // Mark transaction as CANCELLED
//         await tx.bettingRecordSports.update({
//           where: { transactionId },
//           data: {
//             status: "CANCELLED",
//             roundFinished: true,
//           },
//         });
//       });

//       return createAndLogResponse({
//         status: "success",
//         error: "",
//         login: user.playerId,
//         balance: refundedBalance.toNumber(),
//         currency: currency,
//       });
//     }
//   } catch (error: any) {
//     console.error(`[UNCAUGHT ERROR] Exception caught in API Handler:`, error);
//     return createAndLogResponse(
//       {
//         status: "fail",
//         error: error.message || "unexpected_error",
//         balance: 0,
//         currency: currency,
//         login: "",
//       },
//       400,
//     );
//   }
// }

// // POST Route Export
// export const POST = async (req: NextRequest) => {
//   const rawBodyText = await req.text();
//   let payload = {};
//   try {
//     payload = JSON.parse(rawBodyText || "{}");
//   } catch {
//     console.error("[PARSER ERROR] Failed to parse JSON body");
//   }

//   return handleWebhook(req, payload, rawBodyText, "POST");
// };

// // GET Route Export
// export const GET = async (req: NextRequest) => {
//   const searchParams = req.nextUrl.searchParams;
//   const payload: Record<string, any> = {};

//   searchParams.forEach((value, key) => {
//     if (key !== "signature") {
//       if (value === "true") payload[key] = true;
//       else if (value === "false") payload[key] = false;
//       else payload[key] = value;
//     }
//   });

//   const rawTextToSign = Array.from(searchParams.entries())
//     .filter(([key]) => key !== "signature")
//     .sort(([a], [b]) => a.localeCompare(b))
//     .map(([k, v]) => `${k}=${v}`)
//     .join("&");

//   return handleWebhook(req, payload, rawTextToSign, "GET");
// };

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

const USER_SECRET = process.env.GREGMORN_SECRET || "";

// ============================================================================
// HELPERS
// ============================================================================

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

/**
 * Determines if this is a sports bet based on gameId.
 * Sports betting: gameId === "sportshub:0:0"
 * Casino betting: anything else (including null/undefined)
 */
function isSportsBetting(gameId: string | null | undefined): boolean {
  return gameId === "sportshub:0:0";
}

// ============================================================================
// SPORTS BETTING HANDLER (existing logic)
// ============================================================================

async function handleSportsBet(
  req: NextRequest,
  user: any,
  payload: Record<string, any>,
  currency: string,
): Promise<Response> {
  const { cmd, login, sessionid, transactionId, gameId, info, round_finished } =
    payload;

  const userBalance = new Decimal(user.wallet.balance);
  const bet =
    payload.bet !== undefined ? new Decimal(payload.bet) : new Decimal(0);
  const win =
    payload.win !== undefined ? new Decimal(payload.win) : new Decimal(0);
  const roundId = parseRoundId(info);

  if (cmd === "writeBet") {
    // Idempotency Check
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
        currency: currency,
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
          currency: currency,
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
            currency: currency,
          },
        });
      }

      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: newBalance },
      });

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
          rawInfo: typeof info === "string" ? info : JSON.stringify(info || {}),
        },
      });
    });

    return createAndLogResponse({
      status: "success",
      error: "",
      login: user.playerId,
      balance: newBalance.toNumber(),
      currency: currency,
    });
  }

  if (cmd === "rollback") {
    const existingTx = await db.bettingRecordSports.findUnique({
      where: { transactionId },
    });

    if (!existingTx || existingTx.status === "CANCELLED") {
      console.warn(
        `[CMD: rollback] Transaction '${transactionId}' ${!existingTx ? "not found" : "already CANCELLED"}. Skipping.`,
      );
      return createAndLogResponse({
        status: "success",
        error: "",
        login: user.playerId,
        balance: userBalance.toNumber(),
        currency: currency,
      });
    }

    const refundedBalance = userBalance.add(existingTx.betAmount);

    await db.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: refundedBalance },
      });

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
      currency: currency,
    });
  }

  return createAndLogResponse(
    {
      status: "fail",
      error: "unsupported_command",
      balance: 0,
      currency: currency,
      login: login || "",
    },
    400,
  );
}

// ============================================================================
// CASINO BETTING HANDLER (new logic)
// ============================================================================

async function handleCasinoBet(
  req: NextRequest,
  user: any,
  payload: Record<string, any>,
  currency: string,
): Promise<Response> {
  const { cmd, login, transactionId, gameId, info, round_finished } = payload;

  const userBalance = new Decimal(user.wallet.balance);
  const bet =
    payload.bet !== undefined ? new Decimal(payload.bet) : new Decimal(0);
  const win =
    payload.win !== undefined ? new Decimal(payload.win) : new Decimal(0);

  // Casino: profitNLoss = win - bet (negative = loss, positive = win)
  const profitNLoss = win.sub(bet);
  const newBalance = userBalance.add(profitNLoss);
  const roundId = parseRoundId(info);

  if (cmd === "writeBet") {
    // Idempotency Check
    const existingTx = await db.bettingRecord.findFirst({
      where: { wagerCode: transactionId },
    });

    if (existingTx) {
      console.warn(
        `[IDEMPOTENCY] Duplicate casino transaction detected for transactionId: '${transactionId}'. Returning current balance.`,
      );
      return createAndLogResponse({
        status: "success",
        error: "",
        login: user.playerId,
        balance: userBalance.toNumber(),
        currency: currency,
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
          currency: currency,
        },
        400,
      );
    }

    // Determine category from gameId or default to OTHER
    let category: "SLOT" | "LIVE_CASINO" | "OTHER" | "POKER" | "FISH" = "OTHER";
    if (gameId) {
      const gameLower = gameId.toLowerCase();
      if (gameLower.includes("slot")) category = "SLOT";
      else if (gameLower.includes("live")) category = "LIVE_CASINO";
      else if (gameLower.includes("poker")) category = "POKER";
      else if (gameLower.includes("fish")) category = "FISH";
    }

    // Determine status
    const status: "RUNNING" | "SETTLED" | "CANCELED" | "VOID" = round_finished
      ? "SETTLED"
      : "RUNNING";

    await db.$transaction(async (tx) => {
      // Update Wallet Balance
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: newBalance },
      });

      // Create Casino Betting Record
      // Using transactionId as the 'wagerCode' for idempotency
      await tx.bettingRecord.create({
        data: {
          userId: user.id,
          betAmount: bet,
          profitNLoss: profitNLoss,
          category: category,
          status: status,
          roundId: roundId || undefined,
          wagerCode: transactionId, // Idempotency key stored here
          orderNo: undefined,
        },
      });
    });

    return createAndLogResponse({
      status: "success",
      error: "",
      login: user.playerId,
      balance: newBalance.toNumber(),
      currency: currency,
    });
  }

  if (cmd === "rollback") {
    // Find the original bet by wagerCode (transactionId stored there)
    const existingTx = await db.bettingRecord.findFirst({
      where: { wagerCode: transactionId },
    });

    if (!existingTx || existingTx.status === "CANCELED") {
      console.warn(
        `[CMD: rollback] Casino transaction '${transactionId}' ${!existingTx ? "not found" : "already CANCELED"}. Skipping.`,
      );
      return createAndLogResponse({
        status: "success",
        error: "",
        login: user.playerId,
        balance: userBalance.toNumber(),
        currency: currency,
      });
    }

    // Refund the original bet amount
    const refundedBalance = userBalance.add(existingTx.betAmount);

    await db.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: refundedBalance },
      });

      // Mark transaction as CANCELED
      await tx.bettingRecord.update({
        where: { id: existingTx.id },
        data: { status: "CANCELED" },
      });
    });

    return createAndLogResponse({
      status: "success",
      error: "",
      login: user.playerId,
      balance: refundedBalance.toNumber(),
      currency: currency,
    });
  }

  return createAndLogResponse(
    {
      status: "fail",
      error: "unsupported_command",
      balance: 0,
      currency: currency,
      login: login || "",
    },
    400,
  );
}

// ============================================================================
// MAIN WEBHOOK HANDLER (dispatcher)
// ============================================================================

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

  // Fetch user
  const user = await db.users.findUnique({
    where: { playerId: payload.login },
    select: { id: true, wallet: true, playerId: true },
  });

  if (!user || !user.wallet || !user.wallet.currencyCode)
    return createAndLogResponse(
      {
        status: "fail",
        error: "user_not_found",
        balance: 0,
        currency: "",
        login: payload.login || "",
      },
      400,
    );

  const currency = user.wallet.currencyCode;

  try {
    // Verify signature
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
          currency: currency,
          login: payload.login || "",
        },
        400,
      );
    }

    const { cmd, gameId } = payload;

    // Validate command
    if (!["getBalance", "writeBet", "rollback"].includes(cmd)) {
      console.error(`[COMMAND ERROR] Unknown or unsupported command: '${cmd}'`);
      return createAndLogResponse(
        {
          status: "fail",
          error: "cmd_not_found",
          balance: 0,
          currency: currency,
          login: payload.login || "",
        },
        400,
      );
    }

    const userBalance = new Decimal(user.wallet.balance);

    // --- COMMAND: getBalance (same for both sports and casino) ---
    if (cmd === "getBalance") {
      console.log(
        `[CMD: getBalance] Returning balance for user: ${user.playerId}`,
      );
      return createAndLogResponse({
        status: "success",
        error: "",
        login: user.playerId,
        balance: userBalance.toNumber(),
        currency: currency,
      });
    }

    // --- ROUTE BASED ON GAME TYPE ---
    if (isSportsBetting(gameId)) {
      console.log(`[ROUTING] Sports betting detected (gameId: ${gameId})`);
      return await handleSportsBet(req, user, payload, currency);
    } else {
      console.log(`[ROUTING] Casino betting detected (gameId: ${gameId})`);
      return await handleCasinoBet(req, user, payload, currency);
    }
  } catch (error: any) {
    console.error(`[UNCAUGHT ERROR] Exception caught in API Handler:`, error);
    return createAndLogResponse(
      {
        status: "fail",
        error: error.message || "unexpected_error",
        balance: 0,
        currency: user.wallet.currencyCode || "",
        login: payload.login || "",
      },
      400,
    );
  }
}

// ============================================================================
// ROUTE EXPORTS
// ============================================================================

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
