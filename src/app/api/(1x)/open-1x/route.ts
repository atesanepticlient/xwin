import { NextResponse } from "next/server";
import crypto from "crypto";
import { findCurrentUser } from "@/data/user";
import { replaceDomain } from "@/lib/utils";

const FALLBACK_SPORTS_URL =
  "https://sportshub-custom001.network/sports/live?lng=en";

export async function POST(req: Request) {
  try {
    const user = await findCurrentUser();

    // Return the public sports URL when the user is not authenticated.
    if (!user) {
      console.log(
        "[OPEN GAME] No authenticated user. Returning fallback sports URL.",
      );

      return NextResponse.json({
        success: true,
        fallback: true,
        data: {
          content: {
            game: {
              url: FALLBACK_SPORTS_URL,
            },
          },
        },
      });
    }

    const reqBody = await req.json().catch(() => ({}));
    const { gameId } = reqBody;

    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 },
      );
    }

    const userLoginId = user.playerId;
    const userCurrency = user.wallet?.currencyCode || "BDT";

    const body = {
      currency: userCurrency,
      demo: "0",
      exitUrl: process.env.CLINET_URL || "https://www.winparibet.com",
      gameId,
      language: "en",
      player_login: userLoginId,
      user_id: "6712031e-2632-4b4c-9226-8e19215a4ebb",
      callbackUrl: "https://www.winparibet.com/api/gregmorn/callbacks",
    };

    const rawBody = JSON.stringify(body);

    const signature = crypto
      .createHmac("sha256", process.env.GREGMORN_SECRET!)
      .update(rawBody, "utf8")
      .digest("hex");

    const providerUrl = `${process.env.GREGMORN_CLIENT}/games/openGame`;

    const response = await fetch(providerUrl, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        "X-Signature": signature,
      },
      body: rawBody,
    });

    const data = await response.json();

    console.log(
      "[OPEN GAME PROVIDER RESPONSE]:",
      JSON.stringify(data, null, 2),
    );

    if (!response.ok || data.status !== "success") {
      return NextResponse.json(
        { error: "Game is under maintenance" },
        { status: 400 },
      );
    }

    if (gameId === process.env.GREGMORN_1XID) {
      data.content.game.url = replaceDomain(
        data.content.game.url,
        process.env.XBET_CUSTOM_LINK!,
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: response.status,
        data,
      },
      { status: response.status },
    );
  } catch (error: unknown) {
    console.error("[OPEN GAME ERROR]:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
