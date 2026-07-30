import { INTERNAL_SERVER_ERROR } from "@/error";
import axios from "axios";

import games from "@/../data/games.json";

export const GET = async () => {
  try {
    // const data = JSON.stringify({
    //   hall: process.env.HALL_ID,
    //   key: process.env.HALL_KEY,
    //   cmd: "getGamesList",
    //   cdnUrl: "",
    //   img: "game_img_2",
    // });



    // const config = {
    //   method: "post",
    //   maxBodyLength: Infinity,
    //   url: process.env.HALL_HOST,
    //   headers: {
    //     Cookie: "PHPSESSID=tc6on5bce3tcgpiu8c9o8mqtb9",
    //     "Content-Type": "application/json",
    //   },
    //   data: data,
    // };

    // const gamesList = await axios.request(config);

    return Response.json({ success: true, gamesList: games.content });
  } catch (error) {
    console.log("ERROR API ", error);
    return Response.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
