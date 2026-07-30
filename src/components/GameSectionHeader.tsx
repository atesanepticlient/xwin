"use client";

import React from "react";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

interface GameSectionHeaderProps {
  seeMore?: () => void;
  title: string;
  textColor?: "black" | "white" | string; // Allows default presets or custom Tailwind classes
}

const GameSectionHeader: React.FC<GameSectionHeaderProps> = ({
  seeMore,
  title,
  textColor = "black",
}) => {
  // Preset color mappings
  const colorMap: Record<string, { title: string; button: string }> = {
    black: {
      title: "text-gray-900",
      button: "text-gray-800 hover:text-black",
    },
    white: {
      title: "text-white",
      button: "text-gray-300 hover:text-white",
    },
  };

  // Resolve classes based on prop or fallback to custom class string
  const currentTitleColor = colorMap[textColor]?.title || textColor;
  const currentButtonColor =
    colorMap[textColor]?.button || "text-gray-800 hover:text-black";

  return (
    <div className="flex items-center justify-between mb-1 px-1">
      <div
        className={`flex items-center gap-1.5 font-extrabold text-xl tracking-tight ${currentTitleColor}`}
      >
        <span className="text-base md:text-2xl uppercase">{title}</span>
      </div>

      {seeMore && (
        <button
          onClick={seeMore}
          className={`flex items-center gap-0.5 text-xs font-bold tracking-wide uppercase transition ${currentButtonColor}`}
        >
          <span>MORE</span>
          <MdOutlineKeyboardDoubleArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default GameSectionHeader;
