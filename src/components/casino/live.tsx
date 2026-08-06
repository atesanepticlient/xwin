"use client";
import React from "react";
import GameSectionHeader from "../GameSectionHeader";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import { useGames } from "@/lib/store.zustond";
import { GameCard } from "../GameCards";
import { Categories } from "../types/game";
import { redirect } from "next/navigation";
import GamesLoader from "@/app/GamesLoader";

const PopularLive = () => {
  const { getGames } = useGames((state) => state);

  const games = getGames(Categories.LiveDealers, undefined, 20);
  return (
    <div className="px-3 pt-3">
      <GameSectionHeader
        seeMore={() => redirect("/live")}
        title="Live Casino"
      />
      <Swiper slidesPerView={"auto"} spaceBetween={5} className="mySwiper">
        {games?.slice(0, 10).map((game, i) => (
          <SwiperSlide key={i} className="max-w-[40.33%] md:max-w-[20%] pb-2">
            <GameCard game={game} />
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper slidesPerView={"auto"} spaceBetween={5} className="mySwiper">
        {games?.slice(10, 20).map((game, i) => (
          <SwiperSlide key={i} className="max-w-[40.33%] md:max-w-[20%] ">
            <GameCard game={game} />
          </SwiperSlide>
        ))}
      </Swiper>

      {!games && <GamesLoader />}
    </div>
  );
};

export default PopularLive;
