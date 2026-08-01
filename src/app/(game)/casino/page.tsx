"use client";

import React from "react";

import PopularGames from "./popular";
import FishGames from "./fish";
import PockerGames from "./pocket";
import { useSearchGames } from "@/store/useStore";
import SeachGame from "../search-game";
import Slider from "../slider";

const Casino = () => {
  const { showSearchUi, filterParams } = useSearchGames((state) => state);
  console.log({ filterParams });
  return (
    <div className="">
      {showSearchUi ? (
        <SeachGame {...filterParams} />
      ) : (
        <div>
          <div className="bg-[#202020] pt-2 pb-3.5 px-2">
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
          </div>

          <div className="p-2.5 md:p-3 lg:p-5">
            <PopularGames />
            <FishGames />
            <PockerGames />
          </div>
        </div>
      )}

      {/* <TabBar /> */}
    </div>
  );
};

export default Casino;
