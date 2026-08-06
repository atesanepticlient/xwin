// lib/live-matches-cache.ts
// GUESSED shape based on DashboardWrapper usage — please paste your real file
// so I can merge this in correctly instead of overwriting other fields.

import { LiveMatchCardProps } from "@/components/category/live-match-selection";
import { EsportsMatchCardProps } from "@/components/esports-match-card";
import { Tournament } from "@/components/live-tournament";

export const liveMatchesCache: {
  liveMatches: LiveMatchCardProps[];
  sportsMatches: LiveMatchCardProps[];
  esportsMatches: EsportsMatchCardProps[];
  tournaments: Tournament[];
  totalLive: number;
  totalSports: number;
  totalEsports: number;
  totalTournaments: number;
  hasData: boolean;
} = {
  liveMatches: [],
  sportsMatches: [],
  esportsMatches: [],
  tournaments: [],
  totalLive: 0,
  totalSports: 0,
  totalEsports: 0,
  totalTournaments: 0,
  hasData: false,
};
