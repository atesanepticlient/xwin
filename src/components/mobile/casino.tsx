import React from "react";
import Slots from "@/app/(game)/casino/slots";
import PopularLive from "@/app/(game)/casino/popular-live";

import casino_banner from "@/../public/assets/images/casino-category/casino-banner.png";
import bingo from "@/../public/assets/images/casino-category/bingo.png";
import crash from "@/../public/assets/images/casino-category/crash.png";
import fish from "@/../public/assets/images/casino-category/fish.png";
import live from "@/../public/assets/images/casino-category/live.png";
import keno from "@/../public/assets/images/casino-category/keno.png";
import slots from "@/../public/assets/images/casino-category/slots.png";
import dice from "@/../public/assets/images/casino-category/dice.png";
import poker from "@/../public/assets/images/casino-category/poker.png";
import Image from "next/image";
import Link from "next/link";

const MobileCasinoTab = () => {
  return (
    <div className="space-y-3">
      <CasinoBanner />
      <Slots theme="light" maxRow={1} />
      <PopularLive theme="light" maxRow={1} />
      <CasinoCategory />
    </div>
  );
};

export default MobileCasinoTab;

const CasinoBanner = () => {
  return (
    <div className="relative ">
      <Image
        alt="Casino"
        placeholder="blur"
        src={casino_banner}
        className="w-full rounded-3xl select-none"
      />

      <p className="absolute bottom-3.5 left-3 text-lg font-bold text-white">
        My casino
      </p>
    </div>
  );
};

const casinoCategoris = [
  {
    image: slots,
    label: "Slots",
    name: "slots",
    link: "/casino?category=slots",
  },
  {
    image: bingo,
    label: "Bingo",
    name: "bingo",
    link: "/casino?category=bingo",
  },
  {
    image: live,
    label: "Live Casino",
    name: "live dealer",
    link: "/live?category=live dealer",
  },
  {
    image: crash,
    label: "Crash",
    name: "crash",
    link: "/casino?category=crash",
  },
  {
    image: keno,
    label: "Keno",
    name: "keno",
    link: "/casino?provider=keno&category=keno",
  },
  {
    image: fish,
    label: "Fishing",
    name: "fish",
    link: "/casino?category=fish",
  },
  {
    image: dice,
    label: "Dice",
    name: "dice",
    link: "/casino?category=dice",
  },
  {
    image: poker,
    label: "Poker",
    name: "poker",
    link: "/casino?category=poker",
  },
];

const CasinoCategory = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-bold text-lg sm:text-xl tracking-tight text-black">
          <span>Cateogry</span>
        </div>
        <button
          className={`flex items-center gap-0.5 text-xs font-bold tracking-wide uppercase transition `}
        >
          <span className="bg-white text-black !text-xs px-4 py-1.5 capitalize rounded-2xl">
            All
          </span>
        </button>
      </div>
      <div className="flex gap-2 flex-nowrap max-w-full hide-scrollbar overflow-x-auto">
        {casinoCategoris.map((category, i) => (
          <Link href={category.link}>
            {" "}
            <div
              key={i}
              className="relative max-w-[85px] min-w-[85px] rounded-2xl"
            >
              <Image
                placeholder="blur"
                alt={category.name}
                src={category.image}
                className="w-full rounded-2xl  select-none aspect-[2/3] object-cover"
              />
              <span className="absolute bottom-1 left-2 font-bold text-xs text-white ">
                {category.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
