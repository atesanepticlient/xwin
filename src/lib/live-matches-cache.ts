// lib/live-matches-cache.ts

import { LiveMatchCardProps } from "@/components/category/live-match-selection";

export const liveMatchesCache: {
  liveMatches: LiveMatchCardProps[];
  sportsMatches: LiveMatchCardProps[];
  totalLive: number;
  totalSports: number;
  hasData: boolean;
} = {
  liveMatches: [],
  sportsMatches: [],
  totalLive: 0,
  totalSports: 0,
  hasData: false,
};
