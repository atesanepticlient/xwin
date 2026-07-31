// app/api/open-game/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import { findCurrentUser } from "@/data/user";
import { replaceDomain } from "@/lib/utils";

export async function POST() {
  try {
    const user = await findCurrentUser();

    if (!user) {
      console.error("[OPEN GAME] Auth failed: No current user found.");
      return Response.json(
        { message: "Authentication failed" },
        { status: 401 },
      );
    }

    const userLoginId = user.playerId;

    const body = {
      currency: "BDT",
      demo: "0",
      exitUrl: process.env.CLINET_URL || "https://google.com",
      gameId: process.env.GREGMORN_1XID,
      language: "en",
      player_login: userLoginId,
      user_id: "6712031e-2632-4b4c-9226-8e19215a4ebb",
      callbackUrl: "https://www.winparibet.com/api/gregmorn/callbacks",
    };

    // IMPORTANT: Sign the exact string you're going to send.
    const rawBody = JSON.stringify(body);

    const signature = crypto
      .createHmac("sha256", process.env.GREGMORN_SECRET!)
      .update(rawBody, "utf8")
      .digest("hex");

    const providerUrl = `${process.env.GREGMORN_CLIENT}/games/openGame`;

    // --- LOGS FOR THUNDER CLIENT ---
    console.log("\n==================================================");
    console.log("⚡ THUNDER CLIENT DEBUG DETAILS");
    console.log("==================================================");
    console.log(`[URL]:          ${providerUrl}`);
    console.log(`[Method]:       POST`);
    console.log(`[Header] X-Signature:    ${signature}`);
    console.log(`[Header] Content-Type:   application/json`);
    console.log(`[Header] Accept:         */*`);
    console.log(`[RAW JSON Body]:`);
    console.log(rawBody);
    console.log("==================================================\n");

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

    if (data.status !== "success") {
      return NextResponse.json(
        { error: "Game is under maintainance" },
        { status: 400 },
      );
    }

    const rawSportUrl = replaceDomain(
      data.content.game.url,
      process.env.XBET_CUSTOM_LINK!,
    );
    data.content.game.url = rawSportUrl;

    return NextResponse.json(
      {
        success: response.ok,
        status: response.status,
        data,
      },
      {
        status: response.status,
      },
    );
  } catch (error: any) {
    console.error("[OPEN GAME ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
