// components/esports-match-card.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Star, Lock } from "lucide-react";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { GoPlay } from "react-icons/go";
import GameSectionHeader from "./GameSectionHeader";
import { redirect } from "next/navigation";
const MOBILE = true;
export interface EsportsMarket {
  name: string;
  value: string | number;
  isLocked?: boolean;
}

export interface EsportsTeam {
  name: string;
  logoUrl?: string;
}

export interface EsportsMatchCardProps {
  id: string;
  tournamentName: string;
  tournamentIcon?: string;
  homeTeam: EsportsTeam;
  awayTeam: EsportsTeam;
  homeScore: string;
  awayScore: string;
  formatText?: string; // e.g. "Best of 3 maps, 1 map (0-4)"
  marketCategory?: string; // e.g. "1X2"
  currentMapTag?: string; // e.g. "2 map"
  hasLiveStream?: boolean;
  markets: EsportsMarket[];
  matchUrl?: string;
  onOptionClick?: (option: EsportsMarket) => void;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
}

interface EsportsOddsButtonProps {
  option: EsportsMarket;
  onClick?: (option: EsportsMarket) => void;
}

const EsportsOddsButton: React.FC<EsportsOddsButtonProps> = ({
  option,
  onClick,
}) => {
  const [flashState, setFlashState] = useState<"up" | "down" | null>(null);
  const prevOddsRef = useRef<number | null>(null);

  useEffect(() => {
    const currentNum = parseFloat(String(option.value));
    if (!isNaN(currentNum)) {
      if (prevOddsRef.current !== null) {
        if (currentNum > prevOddsRef.current) setFlashState("up");
        else if (currentNum < prevOddsRef.current) setFlashState("down");
      }
      prevOddsRef.current = currentNum;
      const timer = setTimeout(() => setFlashState(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [option.value]);

  const getFlashStyles = () => {
    if (flashState === "up") {
      return "bg-emerald-500/20 border border-emerald-500/40";
    }
    if (flashState === "down") {
      return "bg-rose-500/20 border border-rose-500/40";
    }
    return "bg-gray-100/90 hover:bg-gray-200 active:bg-gray-300 border border-transparent";
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.(option);
      }}
      disabled={option.isLocked}
      className={`flex-1 flex items-center justify-between rounded-xl flex-col px-2.5 py-1.5 transition-all duration-300 ease-in-out ${getFlashStyles()} ${
        option.isLocked ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
        {option.isLocked && <Lock className="w-3 h-3 text-gray-500" />}
        {option.name}
      </span>
      <span className="text-xs font-extrabold text-gray-900">
        {option.value === "-" || option.value === "N/A" ? "-" : option.value}
      </span>
    </button>
  );
};

export const EsportsMatchCard: React.FC<EsportsMatchCardProps> = ({
  id,
  tournamentName,
  tournamentIcon,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  formatText,
  marketCategory = "1X2",
  currentMapTag,
  hasLiveStream,
  markets,
  onOptionClick,
  onFavoriteToggle,
  isFavorite: isFavoriteProp,
}) => {
  const [isFavorite, setIsFavorite] = useState(!!isFavoriteProp);

  return (
    <div className="w-[300px] xs:w-[310px] sm:w-[330px] flex-shrink-0 snap-start bg-white rounded-2xl  p-3 sm:p-3.5 shadow-sm border border-gray-100 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {tournamentIcon ? (
            <Image
              src={tournamentIcon}
              alt={tournamentName}
              width={22}
              height={22}
              className="w-5 h-5 rounded-md object-contain bg-gray-800 flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-md bg-[#808080] flex-shrink-0" />
          )}
          <span className="text-xs font-medium text-[#808080] truncate">
            {tournamentName}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {hasLiveStream && (
            <button
              aria-label="Watch Live"
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </button>
          )}
          {/* <button
            aria-label="Favorite"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const next = !isFavorite;
              setIsFavorite(next);
              onFavoriteToggle?.(id, next);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition"
          >
            <Star
              className={`w-4 h-4 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
            />
          </button> */}

          <button
            aria-label="Play"
            className="flex items-center justify-center w-8 h-8 rounded-full    bg-[#EDF0F2] transition"
          >
            <GoPlay className="text-black w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between py-1">
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          {homeTeam.logoUrl ? (
            <Image
              src={homeTeam.logoUrl}
              alt={homeTeam.name}
              width={18}
              height={18}
              className="w-4 h-4 object-contain"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-200" />
          )}
          <span className="text-xs font-semibold text-black truncate max-w-full">
            {homeTeam.name}
          </span>
        </div>

        <div className="flex items-center gap-2 px-2 flex-shrink-0">
          {/* <div className="w-6 h-8 rounded-md bg-gray-100" /> */}
          <span className="text-2xl font-extrabold text-gray-900 tabular-nums">
            {homeScore} : {awayScore}
          </span>
          {/* <div className="w-6 h-8 rounded-md bg-gray-100" /> */}
        </div>

        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          {awayTeam.logoUrl ? (
            <Image
              src={awayTeam.logoUrl}
              alt={awayTeam.name}
              width={18}
              height={18}
              className="w-4 h-4 object-contain"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-300" />
          )}
          <span className="text-xs font-semibold text-black truncate max-w-full">
            {awayTeam.name}
          </span>
        </div>
      </div>

      {/* Format text */}
      {formatText && (
        <p className="text-center line-clamp-2 text-[9px] text-gray-500 pt-1 pb-2 truncate">
          {formatText}
        </p>
      )}

      {/* Market label row */}
      <div className="flex items-center justify-between pb-1.5">
        <span className="text-xs font-bold text-gray-900">
          {marketCategory}
        </span>
        {currentMapTag && (
          <span className="text-xs font-medium text-gray-400">
            {currentMapTag}
          </span>
        )}
      </div>

      {/* Odds */}
      <div className="flex items-center gap-2 overflow-auto hide-scrollbar">
        {markets.map((option, idx) => (
          <EsportsOddsButton
            key={`${id}-${option.name}-${idx}`}
            option={option}
            onClick={onOptionClick}
          />
        ))}
      </div>
    </div>
  );
};

export interface EsportsSectionProps {
  title?: string;
  count?: number | string;
  matches: EsportsMatchCardProps[];
  onMoreClick?: () => void;
}

export const EsportsSection: React.FC<EsportsSectionProps> = ({
  title = "ESPORTS",
  count,
  matches,
  onMoreClick,
}) => {
  if (matches.length === 0) return null;

  return (
    <section className="w-full font-sans  pt-3">
      <GameSectionHeader
        title={title}
        gameType={"esports"}
        theme="light"
        seeMore={() => {
          redirect("/sports?redirect?=live/esports");
        }}
      />

      <div className="flex gap-2 sm:gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar pb-2">
        {matches.map((match) => (
          <EsportsMatchCard key={match.id} {...match} />
        ))}
      </div>
    </section>
  );
};
