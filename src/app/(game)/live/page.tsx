"use client";

import React from "react";

import { useSearchGames } from "@/store/useStore";
import SeachGame from "../search-game";
import PopularLiveGames from "../casino/popular-live";

const Casino = () => {
  const { showSearchUi, filterParams } = useSearchGames((state) => state);
  return (
    <>
      {showSearchUi ? (
        <SeachGame {...filterParams} />
      ) : (
        <div>
          <PopularLiveGames />
        </div>
      )}

      {/* <TabBar /> */}
    </>
  );
};

export default Casino;
