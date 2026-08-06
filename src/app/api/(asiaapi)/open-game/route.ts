/* eslint-disable @typescript-eslint/no-unused-vars */
import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";
import axios from "axios";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const user = await findCurrentUser();

    if (!user)
      return Response.json({ error: "Refresh the page" }, { status: 401 });

    const playerId = (
      await db.users.findUnique({
        where: { email: user?.email },
        select: {
          playerId: true,
        },
      })
    )?.playerId;

    const { gameId, demo, gameType } = await req.json();

    if (!gameId) {
      return Response.json({ error: "Game Id is required" }, { status: 400 });
    }
    const hallid =
      gameType == "CASINO" ? process.env.HALL_ID : process.env.HALL_ID_TBS;
    const host =
      gameType == "CASINO" ? process.env.HALL_HOST : process.env.HALL_HOST_TBS;
    const data = JSON.stringify({
      hall: hallid,
      key: process.env.HALL_KEY,
      login: playerId,
      gameId: gameId,
      cmd: "openGame",
      demo: "0",
      domain: "https://www.winparibet.com/",
      cdnUrl: "",
      exitUrl: "https://www.winparibet.com/",
      language: "en",
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${host}/openGame/`,
      headers: {
        Cookie: "PHPSESSID=tc6on5bce3tcgpiu8c9o8mqtb9",
        "Content-Type": "application/json",
      },
      data: data,
    };
    const response = await axios.request(config);
    console.log("data", response.data);
    if (response.data.status == "fail") {
      return Response.json({ error: "Try Again" }, { status: 500 });
    }

    const content = response.data.content;
    console.log("Content from route ", content);

    return Response.json({ content: content }, { status: 200 });
  } catch (error) {
    console.log("OPEN GAME ERROR ", error);
    return Response.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
