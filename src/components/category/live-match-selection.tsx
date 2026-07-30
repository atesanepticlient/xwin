"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MoreVertical, Play, Lock } from "lucide-react";
import {
  MdOutlineKeyboardDoubleArrowRight,
  MdOutlineSportsScore,
  MdSportsCricket,
} from "react-icons/md";
import Link from "next/link";
import { IoIosFootball } from "react-icons/io";
import { FaBasketballBall } from "react-icons/fa";
import { IoTennisballSharp } from "react-icons/io5";

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
  sportType: "cricket" | "football" | "basketball" | "tennis" | string;
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

// Helper to render proper sport icon
const getSportIcon = (sportType: string) => {
  switch (sportType.toLowerCase()) {
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

// Sub-component that handles odds tracking and background animations
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

      // Reset flash animation after 2.5 seconds
      const timer = setTimeout(() => {
        setFlashState(null);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [option.odds]);

  // Determine dynamic background and text color based on flash state
  const getFlashStyles = () => {
    if (flashState === "up") {
      return "bg-emerald-500/15 ";
    }
    if (flashState === "down") {
      return "bg-rose-500/15  ";
    }
    return "bg-gray-100/80 hover:bg-gray-200 active:bg-gray-300 text-gray-800";
  };

  return (
    <button
      onClick={() => onClick && onClick(option)}
      className={`
        flex flex-col items-center justify-center
        rounded-xl px-3 py-1.5 transition-colors duration-100 ease-in-out
        ${getFlashStyles()}
        ${isThreeOrLess ? "flex-1 min-w-0" : "flex-shrink-0 min-w-[64px]"}
      `}
    >
      <div
        className={`flex items-center gap-1 text-[10px] uppercase font-semibold tracking-tight text-center leading-tight transition-colors duration-100 text-gray-500`}
      >
        {option.isLocked && <Lock className={`w-2.5 h-2.5 text-gray-600`} />}
        <span>{option.label}</span>
      </div>

      <span
        className={`text-xs font-bold mt-0.5 transition-colors duration-100 text-gray-800`}
      >
        {option.odds === "N/A" ? "-" : option.odds}
      </span>
    </button>
  );
};

export const LiveMatchSection: React.FC<LiveSectionProps> = ({
  liveTitle = "LIVE",
  liveCount = 928,
  matches,
  onMoreLiveClick,
}) => {
  const sportsRedirect =
    liveTitle == "SPORTS" ? "/sports?type=line" : "/sports?type=live";

  return (
    <section className="w-full font-sans px-3 pt-3">
      {/* Top Dynamic Header Bar */}
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="flex items-center gap-1.5 font-extrabold text-xl tracking-tight text-gray-900">
          <span className="text-lg md:text-3xl uppercase">{liveTitle}</span>
          {liveCount !== undefined && (
            <span className="text-gray-500 font-medium text-base md:text-lg">
              ({liveCount})
            </span>
          )}
        </div>

        <button
          onClick={onMoreLiveClick}
          className="flex items-center gap-0.5 text-xs font-bold text-gray-800 hover:text-black tracking-wide uppercase transition"
        >
          <Link href={sportsRedirect}>
            <span>MORE LIVE</span>
          </Link>
          <MdOutlineKeyboardDoubleArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Scrollable Match Cards */}
      <Link href={sportsRedirect}>
        <div className="flex gap-1.5 md:gap-2 lg:gap-3 overflow-x-auto scroll-smooth hide-scrollbar">
          {matches.map((match) => {
            const SportsIcon = getSportIcon(match.sportType);
            return (
              <div
                key={match.id}
                className="w-[330px] flex-shrink-0 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <span className="text-sm">
                        <SportsIcon />
                      </span>
                      <span>{match.statusText}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {match.hasLiveStream && (
                        <button
                          aria-label="Watch Live"
                          className="flex items-center justify-center w-6 h-6 rounded-full bg-[#B2D959] text-white hover:bg-[#7EC151] transition"
                        >
                          <Play className="w-3 h-3 fill-current ml-0.5" />
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
                    <p className="text-sm font-semibold text-gray-800 pt-0.5 pb-1">
                      {match.leagueName}
                    </p>
                  )}

                  {/* Teams & Scores */}
                  <div className="space-y-1.5 py-1">
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {match.homeTeam.logoUrl ? (
                          <Image
                            src={match.homeTeam.logoUrl}
                            alt={match.homeTeam.name}
                            width={15}
                            height={15}
                            className="w-[15px] h-[15px] object-contain"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200" />
                        )}
                        <span className="font-bold text-gray-900 text-sm">
                          {match.homeTeam.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-base text-gray-900">
                          {match.homeTeam.score}
                        </span>
                        {match.homeTeam.oversOrDetails && (
                          <span className="text-xs font-medium text-gray-500">
                            {match.homeTeam.oversOrDetails}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {match.awayTeam.logoUrl ? (
                          <Image
                            src={match.awayTeam.logoUrl}
                            alt={match.awayTeam.name}
                            width={20}
                            height={20}
                            className="w-5 h-5 object-contain"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200" />
                        )}
                        <span className="font-bold text-gray-900 text-sm">
                          {match.awayTeam.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-base text-gray-900">
                          {match.awayTeam.score}
                        </span>
                        {match.awayTeam.oversOrDetails && (
                          <span className="text-xs font-medium text-gray-500">
                            {match.awayTeam.oversOrDetails}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Round Name */}
                  {match.roundName && (
                    <p className="text-[11px] text-gray-500 font-medium pt-1">
                      {match.roundName}
                    </p>
                  )}
                </div>

                {/* Betting Odds Scrollable Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-2">
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
      </Link>
    </section>
  );
};
