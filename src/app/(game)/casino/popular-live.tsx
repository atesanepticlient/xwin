"use client";

import React, { useState, useEffect } from "react";
import GameSectionHeader from "@/components/GameSectionHeader";
import GameCard from "@/components/casino/GameCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";

import popularGameData from "@/../data/live-games.json";
import GameGridSkeleton from "@/components/casino/GameGridSkeleton";
import { useSearchGames } from "@/store/useStore";
import { GameItem } from "@/types/game";

const PopularLiveGames: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [games, setGames] = useState<GameItemd[]>([]);

  const { setFilterProps, toggleSearchUi } = useSearchGames((state) => state);

  useEffect(() => {
    // Simulate data loading/fetching
    const activeGames = (popularGameData.list as GameItem[]).slice(0,20);

    setGames(activeGames);
    setLoading(false);
  }, []);


  const handleSeeMore = ()=>{
    toggleSearchUi()
    setFilterProps({category : "LIVE_CASINO"})
  }

  return (
    <section className="w-full py-4">
      <GameSectionHeader
        title="Popular Now"
        textColor="white"
        seeMore={handleSeeMore}
      />

      <div className="mt-3 min-h-[300px]">
        {loading ? (
          <GameGridSkeleton />
        ) : (
          <Swiper
            modules={[Grid, Pagination]}
            spaceBetween={6}
            centerInsufficientSlides={true}
            slidesPerView={"auto"}
            grid={{
              rows: 2,
              fill: "row",
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            className="w-full !pb-8 select-none cursor-grab active:cursor-grabbing"
          >
            {games.map((game) => (
              <SwiperSlide
                key={`${game.product_code}-${game.game_code}`}
                className="max-w-[150px]"
              >
                <GameCard
                  game={game}
                  onPlay={(g) => console.log("Play", g.game_name)}
                  onPlayFree={(g) => console.log("Free", g.game_name)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default PopularLiveGames;
