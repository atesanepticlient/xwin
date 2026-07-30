"use client";

import React, { useEffect, useState } from "react";
import GameSectionHeader from "@/components/GameSectionHeader";
import GameCard from "@/components/casino/GameCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";

import pockerGameData from "@/../data/poker-games.json";
import GameGridSkeleton from "@/components/casino/GameGridSkeleton";
import { useSearchGames } from "@/store/useStore";
import { GameItem } from "@/types/game";

const PockerGames: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [games, setGames] = useState<GameItem[]>([]);

  const { setFilterProps, toggleSearchUi } = useSearchGames((state) => state);

  useEffect(() => {
    // Simulate data loading/fetching
    const activeGames = (pockerGameData.list as GameItem[]).filter(
      (game) => game.status === "ACTIVATED",
    );

    setGames(activeGames);
    setLoading(false);
  }, []);

  const handleSeeMore = () => {
    toggleSearchUi();
    setFilterProps({ category: "POKER" });
  };

  return (
    <section className="w-full py-4">
      <GameSectionHeader
        title="Pocker"
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
            /* SHOWS 3 FULL GAMES + PEEK OF THE 4TH GAME PER ROW */
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

export default PockerGames;
