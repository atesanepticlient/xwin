"use client";

import React, { useEffect, useState } from "react";
import GameSectionHeader from "@/components/GameSectionHeader";
import GameCard from "@/components/casino/GameCard";
import { usePathname, useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";

import fishGameData from "@/../data/fish-games.json";
import GameGridSkeleton from "@/components/casino/GameGridSkeleton";
import { useSearchGames } from "@/store/useStore";
import { GreGameItem } from "@/types/game";
import { gameSearchEngine } from "@/lib/games";

const Slots = ({
  theme,
  maxRow = 2,
}: {
  theme?: "dark" | "light";
  maxRow?: 1 | 2;
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [games, setGames] = useState<GreGameItem[]>([]);

  const { setFilterProps, toggleSearchUi } = useSearchGames((state) => state);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate data loading/fetching
    const games = gameSearchEngine.getByCategory("slots", 20);
    setGames(games);
    setLoading(false);
  }, []);
  const handleSeeMore = () => {
    if (pathname !== "/casino") {
      router.push("/casino");
      return;
    }

    toggleSearchUi();
    setFilterProps({ category: "slots" });
  };

  useEffect(() => {
    console.log({ loading });
  }, [loading]);

  return (
    <section className="w-full ">
      <GameSectionHeader
        title="Slots"
        theme={theme}
        seeMore={handleSeeMore}
        gameType="slots"
      />

      <div className="mt-3 ">
        {loading ? (
          <GameGridSkeleton theme={theme} />
        ) : (
          <Swiper
            modules={[Grid, Pagination]}
            spaceBetween={6}
            slidesPerView="auto"
            grid={{
              rows: maxRow,
              fill: "row",
            }}
            className="w-full !pb-8 select-none cursor-grab active:cursor-grabbing"
          >
            {games.map((game, i) => (
              <SwiperSlide key={i} className="max-w-[150px]">
                <GameCard
                  theme={theme}
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

export default Slots;
