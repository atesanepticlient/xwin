"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreVertical, Play, Lock } from "lucide-react";
import {
  MdOutlineKeyboardDoubleArrowRight,
  MdOutlineSportsScore,
  MdSportsCricket,
  MdSportsEsports,
} from "react-icons/md";
import { IoIosFootball } from "react-icons/io";
import { FaBasketballBall } from "react-icons/fa";
import { IoTennisballSharp } from "react-icons/io5";
import GameSectionHeader from "../GameSectionHeader";
import { redirect } from "next/navigation";

export interface BettingOption {
  id: string;
  label: string;
  odds: number | string;
  isLocked?: boolean;
}

export interface Team {
  name: string;
  logoUrl?: string;
  score: string;
  oversOrDetails?: string;
}

export interface LiveMatchCardProps {
  id: string;
  sportType:
    | "cricket"
    | "football"
    | "basketball"
    | "tennis"
    | "esports"
    | string;
  statusText: string;
  leagueName?: string;
  roundName?: string;
  hasLiveStream?: boolean;
  homeTeam: Team;
  awayTeam: Team;
  bettingOptions: BettingOption[];
  onOptionClick?: (option: BettingOption) => void;
}

export interface LiveSectionProps {
  liveTitle?: string;
  liveCount?: number | string;
  matches: LiveMatchCardProps[];
  onMoreLiveClick?: () => void;
}

export const getSportIcon = (sportType: string) => {
  const type = sportType.toLowerCase();
  if (
    type.includes("esport") ||
    type.includes("e-sport") ||
    type.includes("dota") ||
    type.includes("cs")
  ) {
    return MdSportsEsports;
  }
  switch (type) {
    case "cricket":
      return MdSportsCricket;
    case "football":
    case "soccer":
      return IoIosFootball;
    case "basketball":
      return FaBasketballBall;
    case "tennis":
      return IoTennisballSharp;
    default:
      return MdOutlineSportsScore;
  }
};

interface OddsButtonProps {
  option: BettingOption;
  isThreeOrLess: boolean;
  onClick?: (option: BettingOption) => void;
}

const OddsButton: React.FC<OddsButtonProps> = ({
  option,
  isThreeOrLess,
  onClick,
}) => {
  const [flashState, setFlashState] = useState<"up" | "down" | null>(null);
  const prevOddsRef = useRef<number | null>(null);

  useEffect(() => {
    const currentNum = parseFloat(String(option.odds));

    if (!isNaN(currentNum)) {
      if (prevOddsRef.current !== null) {
        if (currentNum > prevOddsRef.current) {
          setFlashState("up");
        } else if (currentNum < prevOddsRef.current) {
          setFlashState("down");
        }
      }

      prevOddsRef.current = currentNum;

      const timer = setTimeout(() => {
        setFlashState(null);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [option.odds]);

  const getFlashStyles = () => {
    if (flashState === "up") {
      return "bg-emerald-500/20 text-emerald-700 border border-emerald-500/40 animate-pulse";
    }
    if (flashState === "down") {
      return "bg-rose-500/20 text-rose-700 border border-rose-500/40 animate-pulse";
    }
    return "bg-gray-100/90 hover:bg-gray-200 active:bg-gray-300 text-gray-800 border border-transparent";
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.(option);
      }}
      className={`
        flex flex-col items-center justify-center
        rounded-xl px-2.5 py-1.5 transition-all duration-300 ease-in-out
        ${getFlashStyles()}
        ${isThreeOrLess ? "flex-1 min-w-0" : "flex-shrink-0 min-w-[60px]"}
      `}
    >
      <div className="flex items-center gap-1 text-[10px] uppercase font-semibold tracking-tight text-center leading-tight text-gray-500">
        {option.isLocked && <Lock className="w-2.5 h-2.5 text-gray-600" />}
        <span className="truncate max-w-[50px]">{option.label}</span>
      </div>

      <span className="text-xs font-bold mt-0.5 transition-colors duration-100">
        {option.odds === "N/A" ? "-" : option.odds}
      </span>
    </button>
  );
};

export const LiveMatchSection: React.FC<LiveSectionProps> = ({
  liveTitle = "LIVE",
  liveCount,
  matches,
  onMoreLiveClick,
}) => {
  const sportsRedirect =
    liveTitle === "SPORTS" ? "/sports?redirect=line" : "/sports?redirect=live";
  return (
    <section className="w-full font-sans  pt-3">
      {/* Section Header */}
      <GameSectionHeader
        title={liveTitle}
        gameType={"sports"}
        theme="light"
        seeMore={() => {
          redirect(sportsRedirect);
        }}
      />

      {/* Horizontal Scrollable Matches - Mobile First Layout */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar pb-2">
        {matches.map((match) => {
          const SportsIcon = getSportIcon(match.sportType);
          return (
            <div
              key={match.id}
              className="w-[300px] xs:w-[310px] sm:w-[330px] flex-shrink-0 snap-start bg-white rounded-2xl p-3 sm:p-3.5 shadow-sm border border-gray-100 flex flex-col justify-between"
            >
              <div>
                {/* Status & Live Stream Indicator */}
                <div className="flex items-center justify-between pb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                    <SportsIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate max-w-[170px] xs:max-w-[190px]">
                      {match.statusText}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {match.hasLiveStream && (
                      <button
                        aria-label="Watch Live"
                        className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#B2D959] text-white hover:bg-[#7EC151] transition"
                      >
                        <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5" />
                      </button>
                    )}
                    <button
                      aria-label="More"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* League Name */}
                {match.leagueName && (
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate pt-0.5 pb-1">
                    {match.leagueName}
                  </p>
                )}

                {/* Teams & Dynamic Scores */}
                <div className="space-y-1.5 py-1">
                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {match.homeTeam.logoUrl ? (
                        <Image
                          src={match.homeTeam.logoUrl}
                          alt={match.homeTeam.name}
                          width={18}
                          height={18}
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0"
                        />
                      ) : (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-200 flex-shrink-0" />
                      )}
                      <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                        {match.homeTeam.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="font-bold text-sm sm:text-base text-gray-900">
                        {match.homeTeam.score}
                      </span>
                      {match.homeTeam.oversOrDetails && (
                        <span className="text-[10px] sm:text-xs font-medium text-gray-500">
                          {match.homeTeam.oversOrDetails}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {match.awayTeam.logoUrl ? (
                        <Image
                          src={match.awayTeam.logoUrl}
                          alt={match.awayTeam.name}
                          width={18}
                          height={18}
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0"
                        />
                      ) : (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-200 flex-shrink-0" />
                      )}
                      <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                        {match.awayTeam.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="font-bold text-sm sm:text-base text-gray-900">
                        {match.awayTeam.score}
                      </span>
                      {match.awayTeam.oversOrDetails && (
                        <span className="text-[10px] sm:text-xs font-medium text-gray-500">
                          {match.awayTeam.oversOrDetails}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {match.roundName && (
                  <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium pt-0.5 truncate">
                    {match.roundName}
                  </p>
                )}
              </div>

              {/* Betting Odds Horizontal Scrollable Area */}
              <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-2 mt-1">
                {match.bettingOptions.map((option) => {
                  const isThreeOrLess = match.bettingOptions.length <= 3;
                  return (
                    <OddsButton
                      key={option.id}
                      option={option}
                      isThreeOrLess={isThreeOrLess}
                      onClick={match.onOptionClick}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
