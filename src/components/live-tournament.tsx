"use client";

import Image from "next/image";
import Link from "next/link";
import { FaRegStar } from "react-icons/fa";
import { GiWorld } from "react-icons/gi";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { getSportIcon } from "./category/live-match-selection";
import GameSectionHeader from "./GameSectionHeader";
import { redirect } from "next/navigation";

export interface Tournament {
  eventCount: number;
  flag: string;
  name: string;
  sportIcon: string;
  sportType: string;
  url: string;
}
const MOBILE = true;
interface LiveTournamentProps {
  count: number;
  title: string;
  matches: Tournament[];
}

export const LiveTournament = ({
  title = "LIVE Tournament",
  count = 0,
  matches = [],
}: LiveTournamentProps) => {
  function chunk<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];

    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }

    return result;
  }

  const tournaments = chunk<Tournament>(matches, 3);
  return (
    <div>
      <section className="w-full font-sans  pt-3">
        <GameSectionHeader
          title={title}
          gameType={"sports"}
          theme="light"
          seeMore={() => {
            redirect("/sports?redirect?live/football");
          }}
        />

        <div className="flex gap-2  overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar pb-2 hide-scrollbar flex-nowrap">
          {tournaments.map((matches, i) => (
            <div key={i} className="flex flex-col gap-2">
              {matches.map((match) => {
                const Icon = getSportIcon(match.sportType.toLocaleLowerCase());
                return (
                  <div className="bg-white px-3 py-4 rounded-2xl flex justify-between items-center min-w-[300px]">
                    <div className="flex items-center gap-2">
                      {match.flagType === "image" ? (
                        <div className="relative">
                          <Image
                            width={24}
                            height={24}
                            className="w-6 aspect-square rounded-full object-cover"
                            src={match.flag}
                            alt={match.name}
                          />
                          <div className="absolute"></div>
                        </div>
                      ) : match.flagType === "svg" ? (
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            width={24}
                            height={24}
                            className="w-6 h-6 aspect-square rounded-full object-cover"
                            src={match.flag}
                            alt={match.name}
                          />
                          <div className="absolute"></div>
                        </div>
                      ) : (
                        <GiWorld className="text-blue-600 w-7 h-7" />
                      )}

                      <p className="max-w-[85%] line-clamp-1 text-xs text-[rgb(149,149,149)]">
                        {match.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="bg-[rgb(228,228,228)] text-[10px] font-medium flex justify-center items-center w-5 h-5 rounded-full text-[#252525]">
                        {match.eventCount}
                      </div>
                      <button>
                        <FaRegStar className="text-[#252525] w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
