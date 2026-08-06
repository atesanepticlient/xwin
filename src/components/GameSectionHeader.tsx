"use client";

import React from "react";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { useAppStore } from "@/lib/store.zustond";

interface GameSectionHeaderProps {
  seeMore?: () => void;
  title: string;
  gameType?: "slots" | "live" | "sports" | "esports";
  theme?: "dark" | "light";
}

const GameSectionHeader: React.FC<GameSectionHeaderProps> = ({
  seeMore,
  title,
  theme = "dark",
  gameType,
}) => {
  const { isMobileSubdomain } = useAppStore();

  // Color mappings based on theme
  const colorMap: Record<"dark" | "light", { title: string; button: string }> =
    {
      dark: {
        title: "text-white",
        button: "text-gray-300 hover:text-white",
      },
      light: {
        title: "text-gray-900",
        button: "text-gray-700 hover:text-black",
      },
    };

  const { title: titleColorClass, button: buttonColorClass } =
    colorMap[theme] || colorMap.dark;

  return (
    <div className="flex items-center justify-between mb-1 px-1">
      {!isMobileSubdomain ? (
        <div
          className={`flex items-center gap-1.5 font-bold text-lg sm:text-xl tracking-tight ${titleColorClass}`}
        >
          <span className="uppercase">{title}</span>
        </div>
      ) : (
        <div
          className={`flex items-center gap-1.5 font-extrabold text-lg sm:text-xl tracking-tight ${titleColorClass}`}
        >
          <span className="capitalize">{title}</span>

          {gameType && (
            <span
              className={`text-xs font-medium capitalize rounded-3xl px-2 py-0.5 border ${
                gameType === "slots"
                  ? "text-[rgb(223,113,149)] border-[rgb(223,113,149)]"
                  : gameType == "esports"
                    ? "text-[rgb(136,140,236)] border-[rgb(136,140,236)]"
                    : gameType === "sports"
                      ? theme === "dark"
                        ? "text-gray-200 border-gray-200"
                        : "text-[#242424] border-[#242424]"
                      : "text-[rgb(86,169,187)] border-[rgb(86,169,187)]"
              }`}
            >
              {gameType}
            </span>
          )}
        </div>
      )}

      {seeMore && (
        <button
          onClick={seeMore}
          className={`flex items-center gap-0.5 text-xs font-bold tracking-wide uppercase transition ${buttonColorClass}`}
        >
          {isMobileSubdomain ? (
            <span className="bg-white text-black text-xs px-4 py-1.5 capitalize rounded-2xl font-semibold">
              All
            </span>
          ) : (
            <>
              <span>MORE LIVE</span>
              <MdOutlineKeyboardDoubleArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default GameSectionHeader;
