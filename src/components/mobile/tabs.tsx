"use client";

import useCurrentUser from "@/hook/useCurrentUser";
import { useMobileHomeTabsStore } from "@/lib/store.zustond";
import { redirect } from "next/navigation";
import React from "react";
import { FaAward, FaDice } from "react-icons/fa";
import { GiPokerHand, GiSoccerBall } from "react-icons/gi";
import { IoGameController } from "react-icons/io5";

const tabsData = [
  {
    name: "TOP",
    icon: FaAward,
    label: "Top",
  },
  {
    name: "SPORTS",
    icon: GiSoccerBall,
    label: "Sports",
  },
  {
    name: "CASINO",
    icon: GiPokerHand,
    label: "Casino",
  },
  {
    name: "ESPORTS",
    icon: IoGameController,
    label: "Esports",
  },
  {
    name: "GAMES",
    icon: FaDice,
    label: "Games",
  },
] as const;

const MobileHomePageTabps = () => {
  const { selectedTab, setSelectedTab } = useMobileHomeTabsStore();
  const user = useCurrentUser();
  const handleClick = (tabName: any) => {
    if (!user) return redirect("/login");
    setSelectedTab(tabName);
  };
  return (
    <div>
      <div className="flex items-center mt-4">
        {tabsData.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.name}
              onClick={() => handleClick(tab.name)}
              className="flex-1 flex flex-col gap-1.5 relative"
            >
              <Icon
                className={`w-6 h-6 mx-auto ${
                  selectedTab === tab.name ? "text-[#242424]" : "text-[#808080]"
                }`}
              />

              <span
                className={`text-[9px] ${
                  selectedTab === tab.name ? "text-[#242424]" : "text-[#808080]"
                }`}
              >
                {tab.label}
              </span>

              {selectedTab === tab.name && (
                <div className="w-full h-[3px] absolute left-0 right-0 -bottom-2 rounded-t-md bg-[#242424]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileHomePageTabps;
