// app/api/open-game/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import { findCurrentUser } from "@/data/user";
import { replaceDomain } from "@/lib/utils";
export async function POST() {
  try {
    const user = await findCurrentUser();

    if (!user)
      return Response.json(
        { message: "Authentication failed" },
        { status: 401 },
      );
    const userLoginId = user.playerId;
    // const userIp =
    //   headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    //   headersList.get("x-real-ip") ||
    //   "Unknown";

    const body = {
      currency: "BDT",
      demo: "0",
      exitUrl: process.env.CLINET_URL || "https://google.com",
      gameId: process.env.GREGMORN_1XID,
      language: "en",
      player_login: userLoginId,
      user_id: "6712031e-2632-4b4c-9226-8e19215a4ebb",
      callbackUrl: "https://www.winparibet.com/api/gregmorn/callbacks",
      //   ip: userIp,
    };

    // IMPORTANT:
    // Sign the exact string you're going to send.
    const rawBody = JSON.stringify(body);

    const signature = crypto
      .createHmac("sha256", process.env.GREGMORN_SECRET!)
      .update(rawBody, "utf8")
      .digest("hex");

    const response = await fetch(
      `${process.env.GREGMORN_CLIENT}/games/openGame`,
      {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "X-Signature": signature,
        },
        body: rawBody,
      },
    );

    const data = await response.json();
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
