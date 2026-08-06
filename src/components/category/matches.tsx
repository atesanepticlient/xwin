"use client";

import React from "react";
import { LiveMatchSection as BaseLiveMatchSection } from "./live-match-selection";
import { EsportsSection as BaseEsportsSection } from "../esports-match-card";
import { LiveTournament as BaseLiveTournament } from "../live-tournament";
import { useLiveMatches } from "@/hooks/useSports";

const LoadingSkeleton = () => (
  <section className="w-full font-sans pt-3">
    <div className="flex gap-3 overflow-x-auto hide-scrollbar">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[330px] h-[180px] flex-shrink-0 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// Main Component
export const SportsWrapper: React.FC & {
  TopLive: React.FC;
  PreMatch: React.FC;
  EsportsLive: React.FC;
  LiveTournaments: React.FC;
} = () => {
  const { loading, error, liveMatches } = useLiveMatches();

  if (loading) return <LoadingSkeleton />;

  if (error && liveMatches.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">Failed to load data: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-red-700 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SportsWrapper.TopLive />
      <SportsWrapper.PreMatch />
      <SportsWrapper.EsportsLive />
      <SportsWrapper.LiveTournaments />
    </div>
  );
};

// Sub-components bound to SportsWrapper
SportsWrapper.TopLive = () => {
  const { liveMatches, totalLive, loading } = useLiveMatches();
  if (loading) return <LoadingSkeleton />;
  return (
    <BaseLiveMatchSection
      liveTitle="Top LIVE"
      liveCount={totalLive}
      matches={liveMatches}
    />
  );
};

SportsWrapper.PreMatch = () => {
  const { sportsMatches, totalSports, loading } = useLiveMatches();
  if (loading) return <LoadingSkeleton />;
  return (
    <BaseLiveMatchSection
      liveTitle="Top pre-match"
      liveCount={totalSports}
      matches={sportsMatches}
    />
  );
};

SportsWrapper.EsportsLive = () => {
  const { esportsMatches, totalEsports, loading } = useLiveMatches();
  if (loading) return <LoadingSkeleton />;
  return (
    <BaseEsportsSection
      title="Esports LIVE"
      count={totalEsports}
      matches={esportsMatches}
    />
  );
};

SportsWrapper.LiveTournaments = () => {
  const { tournaments, totalTournaments, loading } = useLiveMatches();
  console.log({ tournaments });
  if (loading) return <LoadingSkeleton />;
  return (
    <BaseLiveTournament
      title="LIVE Tournaments"
      count={totalTournaments}
      matches={tournaments}
    />
  );
};
