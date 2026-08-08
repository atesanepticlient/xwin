"use client";

import React, { useState } from "react";
import MobileHeader from "./header";
import Home from "./home";
import Category from "./category";
import { useMobileHomeTabsStore } from "@/lib/store.zustond";
import BottomTab from "./BottomTab";
import Sports from "./sports";
import MobileCasinoTab from "./casino";
import Esports from "./e-sports";

export const MobileHomePage = () => {
  const selectedTab = useMobileHomeTabsStore((state) => state.selectedTab);
  return (
    <div>
      <MobileHeader />

      <main className="w-full bg-[#EDF0F2]  pb-[75px] ">
        {selectedTab == "TOP" && <Home />}
        {selectedTab == "SPORTS" && <Sports />}
        {(selectedTab == "CASINO" || selectedTab == "GAMES") && (
          <MobileCasinoTab />
        )}
        {selectedTab == "ESPORTS" && <Esports />}
      </main>

      <BottomTab />
    </div>
  );
};
