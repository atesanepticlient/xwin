"use client";
import React, { useEffect, useState } from "react";
import GameSectionHeader from "../GameSectionHeader";
import { redirect } from "next/navigation";

import allGames from "@/../data/games.json";
import GameCard from "@/components/casino/GameCard";
import { GameItem } from "@/types/game";

const HomeSlots = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [games, setGames] = useState<GameItem[]>([]);

  useEffect(() => {
    // Simulate data loading/fetching
    const activeGames = (allGames.list as GameItem[])
      .filter((game) => game.game_type == "SLOT" || game.game_type == "OTHER")
      .slice(0, 20);

    setGames(activeGames);
    setLoading(false);
  }, []);

  if (loading)
    return (
      <section className="w-full font-sans px-3 pt-3">
        <div className="flex items-center justify-between mb-1 px-1"></div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[330px] h-[180px] flex-shrink-0 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="h-10 bg-gray-200 rounded "></div>
                <div className="h-10 bg-gray-200 rounded "></div>
                <div className="h-10 bg-gray-200 rounded "></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );

  return (
    <div className="py-5 lg:py-7 px-3">
      <GameSectionHeader title="Slots" seeMore={() => redirect("/casino")} />

      <div className="flex gap-1.5 overflow-x-auto max-w-full flex-nowrap hide-scrollbar">
        {games.map((game, i) => (
          <div key={i} className="min-w-[150px]">
            <GameCard
              theme="light"
              game={game}
              onPlay={(g) => console.log("Play", g.game_name)}
              onPlayFree={(g) => console.log("Free", g.game_name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeSlots;
