"use client";

import React from "react";
import { Search, Radio, Star } from "lucide-react";
import Link from "next/link";

export type TabType = "LIVE" | "SPORTS" | null;

export interface SportsHeaderProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  onFavoriteClick?: () => void;
  onSearchClick?: () => void;
}

export const SportsHeaderBar: React.FC<SportsHeaderProps> = ({
  onFavoriteClick,
}) => {
  // Default state is null (no tab selected, matching the image)
  // const [internalTab, setInternalTab] = useState<TabType>(null);

  // const currentTab =
  //   controlledActiveTab !== undefined ? controlledActiveTab : internalTab;

  // const handleTabClick = (tab: TabType) => {
  //   const nextTab = currentTab === tab ? null : tab;
  //   setInternalTab(nextTab);
  //   if (onTabChange) {
  //     onTabChange(nextTab);
  //   }
  // };

  return (
    <div className="bg-gray-200/90">
      <div className="w-full max-w-xl py-1 px-2 rounded-2xl flex items-center gap-1.5 font-sans md:hidden">
        {/* LIVE Tab */}
        <Link
          href={"/sports?type=live"}
          className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-1.5 font-bold text-gray-700 text-sm tracking-wide transition-all duration-150 bg-white hover:bg-gray-50`}
        >
          <Radio className="w-4 h-4 text-lime-500 stroke-[2.5]" />
          <span>LIVE</span>
        </Link>

        {/* SPORTS Tab */}
        <Link
          href={"/sports?type=line"}
          className={`flex-1 h-12 rounded-xl flex items-center justify-center font-bold text-gray-700 text-sm tracking-wide transition-all duration-150 bg-white hover:bg-gray-50`}
        >
          SPORTS
        </Link>

        {/* Favorites Button */}
        <button
          type="button"
          onClick={onFavoriteClick}
          aria-label="Favorites"
          className="w-12 h-12 bg-white hover:bg-gray-50 active:scale-95 transition rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
        >
          <Star className="w-5 h-5 fill-[#499A13] text-[#499A13]" />
        </button>

        {/* Search Button */}
        <Link
          href={"/sports?type=live"}
          aria-label="Search"
          className="w-12 h-12 bg-white hover:bg-gray-50 active:scale-95 transition rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
        >
          <Search className="w-5 h-5 text-gray-800 stroke-[2.5]" />
        </Link>
      </div>
    </div>
  );
};
