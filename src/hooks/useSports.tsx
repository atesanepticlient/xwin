// @/hooks/useLiveMatches.ts
import { useState, useEffect } from "react";

import {
  EsportsMarket,
  EsportsMatchCardProps,
} from "@/components/esports-match-card";
import { liveMatchesCache } from "@/lib/live-matches-cache";
import { BettingOption, LiveMatchCardProps } from "@/components/category/live-match-selection";

const getDefaultLogo = (teamName: string): string => {
  const name = teamName.toLowerCase();
  if (name.includes("united")) return "/team-logos/united.png";
  if (name.includes("city")) return "/team-logos/city.png";
  if (name.includes("liverpool")) return "/team-logos/liverpool.png";
  if (name.includes("real madrid")) return "/team-logos/real-madrid.png";
  if (name.includes("barcelona")) return "/team-logos/barcelona.png";
  return "";
};

const fixImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `https://1xframemxz.com${url}`;
  return url;
};

const transformMatches = (
  matches: any[],
  type: "live" | "sport",
): LiveMatchCardProps[] => {
  const result: LiveMatchCardProps[] = [];

  matches.forEach((match) => {
    const isCricket = match.sport_type?.toLowerCase() === "cricket";

    let homeScore = match.home_score || "0";
    let awayScore = match.away_score || "0";
    let homeOvers = "";
    let awayOvers = "";

    if (isCricket) {
      const homeMatch = homeScore.match(/\(([^)]+)\)/);
      const awayMatch = awayScore.match(/\(([^)]+)\)/);
      if (homeMatch) {
        homeOvers = homeMatch[1];
        homeScore = homeScore.replace(/\s*\([^)]*\)/, "");
      }
      if (awayMatch) {
        awayOvers = awayMatch[1];
        awayScore = awayScore.replace(/\s*\([^)]*\)/, "");
      }
    }

    let statusText = match.status || "Event in progress";
    if (match.period) statusText += ` - ${match.period}`;

    const bettingOptions: BettingOption[] = [];
    if (match.markets && Object.keys(match.markets).length > 0) {
      const marketKeys = Object.keys(match.markets);
      marketKeys.forEach((key, idx) => {
        const value = match.markets[key];
        if (value && value !== "N/A" && value !== "-") {
          bettingOptions.push({
            id: `${type}-${result.length}-${idx}`,
            label: key,
            odds: value,
            isLocked: value.includes("Locked"),
          });
        }
      });
    }

    if (bettingOptions.length === 0) {
      bettingOptions.push(
        { id: `${type}-${result.length}-1`, label: "1", odds: "N/A" },
        { id: `${type}-${result.length}-X`, label: "X", odds: "N/A" },
        { id: `${type}-${result.length}-2`, label: "2", odds: "N/A" },
      );
    }

    result.push({
      id: match.match_url || `${type}-${result.length}`,
      sportType: match.sport_type || "unknown",
      statusText: statusText,
      leagueName: match.championship || "",
      roundName: match.round_name || "",
      hasLiveStream: match.is_live || false,
      matchUrl: match.match_url || "",
      homeTeam: {
        name: match.home_team || "Home Team",
        logoUrl:
          fixImageUrl(match.home_logo) || getDefaultLogo(match.home_team),
        score: homeScore,
        oversOrDetails: homeOvers || undefined,
      },
      awayTeam: {
        name: match.away_team || "Away Team",
        logoUrl:
          fixImageUrl(match.away_logo) || getDefaultLogo(match.away_team),
        score: awayScore,
        oversOrDetails: awayOvers || undefined,
      },
      bettingOptions: bettingOptions.slice(0, 5),
      onOptionClick: (option: BettingOption) => {
        console.log("Bet option clicked:", option);
      },
    });
  });

  return result;
};

const transformEsportsMatches = (matches: any[]): EsportsMatchCardProps[] => {
  return matches.map((match, index) => {
    const markets: EsportsMarket[] = (match.markets || []).map((m: any) => ({
      name: m.name,
      value: m.value || "-",
      isLocked: !!m.isLocked,
    }));

    return {
      id: match.match_url || `esports-${index}`,
      tournamentName: match.championship || "eSports Match",
      tournamentIcon: match.tournament_icon || "",
      homeTeam: { name: match.home_team, logoUrl: match.home_logo },
      awayTeam: { name: match.away_team, logoUrl: match.away_logo },
      homeScore: match.home_score || "0",
      awayScore: match.away_score || "0",
      formatText: match.format_text || "",
      marketCategory: match.market_category || "1X2",
      currentMapTag: match.current_map_tag || "",
      hasLiveStream: !!match.has_live_stream,
      markets:
        markets.length > 0
          ? markets
          : [
              { name: "W1", value: "-" },
              { name: "W2", value: "-" },
            ],
      onOptionClick: (option: EsportsMarket) => {
        console.log("Esports bet option clicked:", option);
      },
    };
  });
};

export const useLiveMatches = () => {
  const [liveMatches, setLiveMatches] = useState<LiveMatchCardProps[]>(
    liveMatchesCache.liveMatches,
  );
  const [sportsMatches, setSportsMatches] = useState<LiveMatchCardProps[]>(
    liveMatchesCache.sportsMatches,
  );
  const [esportsMatches, setEsportsMatches] = useState<EsportsMatchCardProps[]>(
    liveMatchesCache.esportsMatches,
  );
  const [loading, setLoading] = useState(!liveMatchesCache.hasData);
  const [error, setError] = useState<string | null>(null);

  const [totalLive, setTotalLive] = useState(liveMatchesCache.totalLive);
  const [totalSports, setTotalSports] = useState(liveMatchesCache.totalSports);
  const [totalEsports, setTotalEsports] = useState(
    liveMatchesCache.totalEsports,
  );
  const [totalTournaments, setTotalTournaments] = useState(
    liveMatchesCache.totalTournaments,
  );
  const [tournaments, setTournaments] = useState(liveMatchesCache.tournaments);

  useEffect(() => {
    const eventSource = new EventSource("/api/live-matches");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.success) {
          const transformedLive = transformMatches(
            data.data.liveMatches,
            "live",
          );
          const transformedSports = transformMatches(
            data.data.sportsMatches,
            "sport",
          );
          const transformedEsports = transformEsportsMatches(
            data.data.esportsMatches || [],
          );

          setLiveMatches(transformedLive);
          setSportsMatches(transformedSports);
          setEsportsMatches(transformedEsports);
          setTournaments(data.data.tournaments);

          setTotalLive(data.total.liveMatches);
          setTotalSports(data.total.sportsMatches);
          setTotalTournaments(data.data.tournaments?.length || 0);
          setTotalEsports(
            data.total.esportsMatches || transformedEsports.length,
          );

          setError(null);

          liveMatchesCache.liveMatches = transformedLive;
          liveMatchesCache.sportsMatches = transformedSports;
          liveMatchesCache.esportsMatches = transformedEsports;
          liveMatchesCache.totalLive = data.total.liveMatches;
          liveMatchesCache.totalSports = data.total.sportsMatches;
          liveMatchesCache.totalEsports =
            data.total.esportsMatches || transformedEsports.length;
          liveMatchesCache.hasData = true;
        } else {
          setError(data.error || "Streaming error encountered");
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      } finally {
        setLoading(false);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      if (!liveMatchesCache.hasData) setError("Connection lost. Retrying...");
      setLoading(false);
    };

    return () => eventSource.close();
  }, []);

  return {
    liveMatches,
    sportsMatches,
    esportsMatches,
    tournaments,
    totalLive,
    totalSports,
    totalEsports,
    totalTournaments,
    loading,
    error,
  };
};
