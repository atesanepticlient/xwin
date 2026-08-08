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
import aviator_banner from "@/../public/assets/images/casino-category/aviator.png";
import feature_games_bg from "@/../public/assets/images/casino-category/feature-game-bg.png";
import useOpenGame from "@/hooks/useOpenGame";
import GameBoard from "../casino/game-board";

const FeaturesGames = () => {
  const games = [
    {
      id: "slotegrator:748:9d9b5b34389337d4e43568b4ba2d56be97de447a",
      isEnabled: true,
      title: "Aviatrix",
      imageUrl:
        "https://gis-static.com/games/Aviatrix/9d9b5b34389337d4e43568b4ba2d56be97de447a.png",
      category: "crash",
      provider: "Aviatrix",
    },
    {
      id: "slotegrator:748:dd6966c763cdb0793074534f250ab52d090e0972",
      isEnabled: true,
      title: "Aviatrix Second Chance",
      imageUrl:
        "https://gis-static.com/games/Aviatrix/dd6966c763cdb0793074534f250ab52d090e0972.png",
      category: "crash",
      provider: "Aviatrix",
    },
    {
      id: "ag:pg:48",
      isEnabled: true,
      title: "Double Fortune",
      imageUrl:
        "https://gis-static.com/games/KAGaming/74566dc08645446f95f1bf859252b3c6.png",
      category: "slots",
      provider: "PG Soft",
    },
    {
      id: "greece:700:30071",
      isEnabled: true,
      title: "Chicken Drop",
      imageUrl:
        "https://static.slot7hub.com/providers/pragmatic/gs2c/common/lobby/v1/apps/game-assets/vs20chickdrop/vs20chickdrop_800x600_NB.jpg",
      category: "Slot",
      provider: "Pragmatic",
    },
  ];
  return (
    <div className="features-games-bg h-[130px] w-full rounded-2xl px-3 flex items-end relative">
      <div className="flex pb-1.5 items-center flex-nowrap overflow-x-auto max-w-full gap-2 hide-scrollbar">
        {games.map((game, i) => (
          <GameCard
            key={i}
            name={game.title}
            image={game.imageUrl}
            gameId={game.id}
          />
        ))}
      </div>
      <p className="top-2 left-6 absolute text-lg text-white font-bold">
        For you
      </p>
    </div>
  );
};

const GameCard = ({
  gameId,
  name,
  image,
}: {
  gameId: string;
  image: string;
  name: string;
}) => {
  const { openGame, gameUrl, gameError, gameOpen, reset, isLoading } =
    useOpenGame({ gameId });

  return (
    <>
      <button
        onClick={openGame}
        className="relative min-w-[120px] overflow-hidden rounded-2xl group"
      >
        <img
          src={image}
          alt={name}
          className="w-full rounded-2xl select-none aspect-[3/2]"
        />

        {/* Smooth black gradient */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Game Name */}
        <div className="absolute bottom-2 left-0 right-0 px-2">
          <p className="truncate text-left text-[10px] max-w-[60%] line-clamp-1 font-semibold text-white drop-shadow-md">
            {name}
          </p>
        </div>
      </button>

      {gameOpen && (
        <GameBoard
          isLoading={isLoading}
          url={gameUrl!}
          onCloseGame={() => reset()}
          error={gameError}
        />
      )}
    </>
  );
};

const Aviator = () => {
  const { openGame, gameUrl, gameError, gameOpen, reset, isLoading } =
    useOpenGame({ gameId: "nova:spribe:Aviator" });
  return (
    <>
      <div className="">
        <button onClick={openGame}>
          {" "}
          <Image
            alt="Aviator"
            src={aviator_banner}
            className="w-full rounded-2xl "
          />
        </button>
      </div>
    </>
  );
};

const MobileCasinoTab = () => {
  return (
    <div className="space-y-3 p-2">
      <CasinoBanner />
      <Slots theme="light" maxRow={1} />
      <Aviator />
      <FeaturesGames />
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
    link: "/casino?category=slot",
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
