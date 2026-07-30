import spribe from "@/../public/assets/images/providers/SPB-BLACK.png";
import jili from "@/../public/assets/images/providers/JL-BLACK.png";
import jdb from "@/../public/assets/images/providers/JDB-BLACK.png";
import pg from "@/../public/assets/images/providers/PG-BLACK.png";
import playtech from "@/../public/assets/images/providers/PT-BLACK.png";
import pragmatic from "@/../public/assets/images/providers/PP-BLACK.png";
import evo from "@/../public/assets/images/providers/EVO-BLACK.png";
import fachi from "@/../public/assets/images/providers/FC-BLACK.png";
import joker from "@/../public/assets/images/providers/JK-BLACK.png";
import sagaming from "@/../public/assets/images/providers/SG-BLACK.png";
import netent from "@/../public/assets/images/providers/NE-BLACK.png";
import redtiger from "@/../public/assets/images/providers/RT-BLACK.png";
import dereamgaming from "@/../public/assets/images/providers/DREAM-BLACK.png";
import biggaming from "@/../public/assets/images/providers/BIG-GAMING.png";
import simpleplay from "@/../public/assets/images/providers/SIMPLE-PLAY-BLACK.png";
import cq9 from "@/../public/assets/images/providers/CQ9-BLACK.png";
import booming from "@/../public/assets/images/providers/BOOMING-BLACK.png";
import wow from "@/../public/assets/images/providers/WOW-BLACK.png";
import bigpot from "@/../public/assets/images/providers/BIG-GAMING.png";
import amigo from "@/../public/assets/images/providers/AMG-BLACK.png";
import dragoon from "@/../public/assets/images/providers/DRAGOON-BLACK.png";
import g5 from "@/../public/assets/images/providers/5G-BLACK.png";
import bng from "@/../public/assets/images/providers/BNG-BLACK.png";
import evoplay from "@/../public/assets/images/providers/EP-BLACK.png";
import spadegaming from "@/../public/assets/images/providers/SA-GAMING-BLACK.png";
import novomatic from "@/../public/assets/images/providers/NOVOMATIC-BLACK.png";
import mrsloty from "@/../public/assets/images/providers/MRSLOTY.png";

import { PiCellSignalSlashBold, PiCherriesFill } from "react-icons/pi";
import { BsFillSuitSpadeFill } from "react-icons/bs";
import { IoFish } from "react-icons/io5";
import { GiPokerHand } from "react-icons/gi";
export enum GAME_TYPE {
  SLOT,
  LIVE_CASINO,
  FISHING,
  COCK_FIGHTING,
  OTHERS,
  POKER,
}

export const providers: {
  name: string;
  image: any;
  product_code: string | number;
  gameType?: GAME_TYPE[];
}[] = [
  // --- First Order (Priority Providers) ---
  {
    name: "Spribe",
    image: spribe,
    product_code: 1138,
  },
  {
    name: "Jili",
    image: jili,
    product_code: 1091,
  },
  {
    name: "JDB",
    image: jdb,
    product_code: 1085,
  },
  {
    name: "PG Soft",
    image: pg,
    product_code: 1007,
  },
  {
    name: "PLAYTECH",
    image: playtech,
    product_code: 1242,
  },
  {
    name: "PragmaticPlay",
    image: pragmatic,
    product_code: 1006,
  },
  {
    name: "SA Gaming",
    image: sagaming,
    product_code: 1185,
  },
  {
    name: "PNG",
    image: "",
    product_code: 1273,
    gameType: [
      GAME_TYPE.COCK_FIGHTING,
      GAME_TYPE.FISHING,
      GAME_TYPE.LIVE_CASINO,
      GAME_TYPE.POKER,
    ],
  },
  {
    name: "Evolution",
    image: evo,
    product_code: 1002,
  },
  {
    name: "Fachai",
    image: fachi,
    product_code: 1079,
  },
  {
    name: "Joker",
    image: joker,
    product_code: 1225,
  },

  // --- Remaining Providers ---
  {
    name: "Evolution (Netent)",
    image: netent,
    product_code: 1168,
  },
  {
    name: "Evolution (RedTiger)",
    image: redtiger,
    product_code: 1169,
  },
  {
    name: "Dream Gaming",
    image: dereamgaming,
    product_code: 1052,
  },
  {
    name: "BigGaming",
    image: biggaming,
    product_code: 1004,
  },
  {
    name: "Simple Play",
    image: simpleplay,
    product_code: 1231,
  },
  {
    name: "CQ9",
    image: cq9,
    product_code: 1009,
  },
  {
    name: "MrSlotty",
    image: mrsloty,
    product_code: 1064,
  },
  {
    name: "BoomingGames",
    image: booming,
    product_code: 1115,
  },
  {
    name: "WOW GAMING",
    image: wow,
    product_code: 1148,
  },
  {
    name: "BIGPOT",
    image: bigpot,
    product_code: 1154,
  },
  {
    name: "N2",
    image: novomatic,
    product_code: 1163,
  },
  {
    name: "AmigoGaming",
    image: amigo,
    product_code: 1192,
  },
  {
    name: "DRAGOON SOFT",
    image: dragoon,
    product_code: 1255,
  },
  {
    name: "5G",
    image: g5,
    product_code: 1259,
  },
  {
    name: "BNG",
    image: bng,
    product_code: 1262,
  },
  {
    name: "Yfg",
    image: evoplay,
    product_code: 1274,
  },
  {
    name: "SpadeGaming",
    image: spadegaming,
    product_code: 1221,
  },
];

export const categories = [
  {
    slug: "LIVE_CASINO",
    name: "Live",
    icon: BsFillSuitSpadeFill,
  },
  {
    slug: "OTHER",
    name: "Crash",
    icon: PiCellSignalSlashBold,
  },
  {
    slug: "SLOT",
    name: "Slot",
    icon: PiCherriesFill,
  },
  {
    slug: "POKER",
    name: "Poker",
    icon: GiPokerHand,
  },
  {
    slug: "FISHING",
    name: "Fish",
    icon: IoFish,
  },
];
