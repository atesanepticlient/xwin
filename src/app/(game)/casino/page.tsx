"use client";

import React from "react";

import DefalutGames from "./defalut-games";
import FilteredGames from "./filteredGames";
import { useGamesFilter } from "@/lib/store.zustond";
import TabBar from "@/components/landing/TabBar";
import PopularGames from "./popular";
import FishGames from "./fish";
import PockerGames from "./pocket";
import { useSearchGames } from "@/store/useStore";
import SeachGame from "../search-game";
import Slider from "../slider";

const Casino = () => {
  const { showSearchUi, filterParams } = useSearchGames((state) => state);
  console.log({ filterParams});
  return (
    <>
      {showSearchUi ? (
        <SeachGame {...filterParams} />
      ) : (
        <div>
          <Slider
            sliders={[
              {
                image: "/assets/images/casino/banner/jili.png",
                link: "#",
              },
              {
                image: "/assets/images/casino/banner/aviator.png",
                link: "#",
              },
              {
                image: "/assets/images/casino/banner/pg-soft.png",
                link: "#",
              },
            ]}
          />
          <PopularGames />
          <FishGames />
          <PockerGames />
        </div>
      )}

      {/* <TabBar /> */}
    </>
  );
};

export default Casino;
