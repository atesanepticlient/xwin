// // components/DashboardWrapper.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   BettingOption,
//   LiveMatchCardProps,
//   LiveMatchSection,
// } from "./live-match-selection";

// interface DashboardWrapperProps {
//   fallbackData?: {
//     liveMatches: LiveMatchCardProps[];
//     sportsMatches: LiveMatchCardProps[];
//   };
// }

// // Helper functions
// const getDefaultLogo = (teamName: string): string => {
//   const name = teamName.toLowerCase();
//   if (name.includes("united")) return "/team-logos/united.png";
//   if (name.includes("city")) return "/team-logos/city.png";
//   if (name.includes("liverpool")) return "/team-logos/liverpool.png";
//   if (name.includes("real madrid")) return "/team-logos/real-madrid.png";
//   if (name.includes("barcelona")) return "/team-logos/barcelona.png";
//   return "";
// };

// const fixImageUrl = (url: string): string => {
//   if (!url) return "";
//   if (url.startsWith("http://") || url.startsWith("https://")) {
//     return url;
//   }
//   if (url.startsWith("//")) {
//     return `https:${url}`;
//   }
//   if (url.startsWith("/")) {
//     return `https://1xframemxz.com${url}`;
//   }
//   return url;
// };

// // Transform matches to component format
// const transformMatches = (
//   matches: any[],
//   type: "live" | "sport",
// ): LiveMatchCardProps[] => {
//   const result: LiveMatchCardProps[] = [];

//   matches.forEach((match, index) => {
//     const isCricket = match.sport_type?.toLowerCase() === "cricket";

//     let homeScore = match.home_score || "0";
//     let awayScore = match.away_score || "0";
//     let homeOvers = "";
//     let awayOvers = "";

//     if (isCricket) {
//       const homeMatch = homeScore.match(/\(([^)]+)\)/);
//       const awayMatch = awayScore.match(/\(([^)]+)\)/);
//       if (homeMatch) {
//         homeOvers = homeMatch[1];
//         homeScore = homeScore.replace(/\s*\([^)]*\)/, "");
//       }
//       if (awayMatch) {
//         awayOvers = awayMatch[1];
//         awayScore = awayScore.replace(/\s*\([^)]*\)/, "");
//       }
//     }

//     // Build status text
//     let statusText = match.status || "Event in progress";
//     if (match.period) {
//       statusText += ` - ${match.period}`;
//     }

//     // Convert markets to betting options
//     const bettingOptions: BettingOption[] = [];
//     if (match.markets && Object.keys(match.markets).length > 0) {
//       const marketKeys = Object.keys(match.markets);
//       marketKeys.forEach((key, idx) => {
//         const value = match.markets[key];
//         if (value && value !== "N/A" && value !== "-") {
//           bettingOptions.push({
//             id: `${type}-${result.length}-${idx}`,
//             label: key,
//             odds: value,
//             isLocked: value.includes("Locked"),
//           });
//         }
//       });
//     }

//     // If no betting options, add defaults
//     if (bettingOptions.length === 0) {
//       bettingOptions.push(
//         { id: `${type}-${result.length}-1`, label: "1", odds: "N/A" },
//         { id: `${type}-${result.length}-X`, label: "X", odds: "N/A" },
//         { id: `${type}-${result.length}-2`, label: "2", odds: "N/A" },
//       );
//     }

//     result.push({
//       id: match.match_url || `${type}-${result.length}`,
//       sportType: match.sport_type || "unknown",
//       statusText: statusText,
//       leagueName: match.championship || "",
//       roundName: match.round_name || "",
//       hasLiveStream: match.is_live || false,
//       matchUrl: match.match_url || "",
//       homeTeam: {
//         name: match.home_team || "Home Team",
//         logoUrl:
//           fixImageUrl(match.home_logo) || getDefaultLogo(match.home_team),
//         score: homeScore,
//         oversOrDetails: homeOvers || undefined,
//       },
//       awayTeam: {
//         name: match.away_team || "Away Team",
//         logoUrl:
//           fixImageUrl(match.away_logo) || getDefaultLogo(match.away_team),
//         score: awayScore,
//         oversOrDetails: awayOvers || undefined,
//       },
//       bettingOptions: bettingOptions.slice(0, 5),
//       onOptionClick: (option: BettingOption) => {
//         console.log("Bet option clicked:", option);
//       },
//     });
//   });

//   return result;
// };

// export const DashboardWrapper: React.FC<DashboardWrapperProps> = ({
//   fallbackData,
// }) => {
//   const [liveMatches, setLiveMatches] = useState<LiveMatchCardProps[]>([]);
//   const [sportsMatches, setSportsMatches] = useState<LiveMatchCardProps[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [totalLive, setTotalLive] = useState<number>(0);
//   const [totalSports, setTotalSports] = useState<number>(0);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await fetch("/api/live-matches");

//         if (!response.ok) {
//           throw new Error(`Failed to fetch: ${response.status}`);
//         }

//         const data = await response.json();

//         if (data.success) {
//           // Transform live matches from /en/live
//           const transformedLive = transformMatches(
//             data.data.liveMatches,
//             "live",
//           );
//           setLiveMatches(transformedLive);
//           setTotalLive(data.total.liveMatches || transformedLive.length);

//           // Transform sports matches from /en/line
//           const transformedSports = transformMatches(
//             data.data.sportsMatches,
//             "sport",
//           );
//           setSportsMatches(transformedSports);
//           setTotalSports(data.total.sportsMatches || transformedSports.length);
//         } else {
//           throw new Error(data.error || "No data received");
//         }
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError(err instanceof Error ? err.message : "Failed to load data");

//         // Use fallback data if provided
//         if (fallbackData) {
//           setLiveMatches(fallbackData.liveMatches || []);
//           setSportsMatches(fallbackData.sportsMatches || []);
//           setTotalLive(fallbackData.liveMatches?.length || 0);
//           setTotalSports(fallbackData.sportsMatches?.length || 0);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [fallbackData]);

//   // Loading state
//   if (loading) {
//     return (
//       <div className="  ">
//         {/* Live Section Loading */}
//         <section className="w-full font-sans px-3 pt-3">
//           <div className="flex items-center justify-between mb-1 px-1">

//           </div>
//           <div className="flex gap-3 overflow-x-auto hide-scrollbar">
//             {[1, 2, 3, 4].map((i) => (
//               <div
//                 key={i}
//                 className="w-[330px] h-[180px] flex-shrink-0 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 animate-pulse"
//               >
//                 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
//                 <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
//                 <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
//                 <div className="grid grid-cols-3 gap-2 mt-3">
//                   <div className="h-10 bg-gray-200 rounded "></div>
//                   <div className="h-10 bg-gray-200 rounded "></div>
//                   <div className="h-10 bg-gray-200 rounded "></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Sports Section Loading */}
//         <section className="w-full font-sans px-3 pt-3 ">

//           <div className="flex gap-3 overflow-x-auto hide-scrollbar">
//             {[1, 2, 3, 4].map((i) => (
//               <div
//                 key={i}
//                 className="w-[330px] h-[180px] flex-shrink-0 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 animate-pulse"
//               >
//                 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
//                 <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
//                 <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
//                 <div className="grid grid-cols-3 gap-2 mt-3">
//                   <div className="h-10 bg-gray-200 rounded "></div>
//                   <div className="h-10 bg-gray-200 rounded "></div>
//                   <div className="h-10 bg-gray-200 rounded "></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       </div>
//     );
//   }

//   // Error state
//   if (error && liveMatches.length === 0 && sportsMatches.length === 0) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
//           <p className="text-red-600">Failed to load data: {error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="mt-3 text-sm text-red-700 underline hover:no-underline"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="">
//       {/* Live Matches Section - from /en/live */}
//       <LiveMatchSection
//         liveTitle="LIVE"
//         liveCount={totalLive}
//         matches={liveMatches}
//         onMoreLiveClick={() => {
//           console.log("More live clicked");
//           // Navigate to full live page
//         }}
//       />

//       {/* Sports Section - from /en/line */}
//       <LiveMatchSection
//         liveTitle="SPORTS"
//         liveCount={totalSports}
//         matches={sportsMatches}
//         onMoreLiveClick={() => {
//           console.log("More sports clicked");
//           // Navigate to sports page
//         }}
//       />

//       <style jsx>{`
//         @keyframes pulse {
//           0%,
//           100% {
//             opacity: 1;
//           }
//           50% {
//             opacity: 0.5;
//           }
//         }
//         .animate-pulse {
//           animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
//         .hide-scrollbar::-webkit-scrollbar {
//           display: none;
//         }
//         .hide-scrollbar {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>
//     </div>
//   );
// };

// components/DashboardWrapper.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  BettingOption,
  LiveMatchCardProps,
  LiveMatchSection,
} from "./live-match-selection";

interface DashboardWrapperProps {
  fallbackData?: {
    liveMatches: LiveMatchCardProps[];
    sportsMatches: LiveMatchCardProps[];
  };
}

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

export const DashboardWrapper: React.FC<DashboardWrapperProps> = ({
  fallbackData,
}) => {
  const [liveMatches, setLiveMatches] = useState<LiveMatchCardProps[]>([]);
  const [sportsMatches, setSportsMatches] = useState<LiveMatchCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalLive, setTotalLive] = useState<number>(0);
  const [totalSports, setTotalSports] = useState<number>(0);

  useEffect(() => {
    // Note: ensure the endpoint path matches your actual route file structure
    const eventSource = new EventSource("/api/live-matches");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.success) {
          const transformedLive = transformMatches(
            data.data.liveMatches,
            "live",
          );
          setLiveMatches(transformedLive);
          setTotalLive(data.total.liveMatches || transformedLive.length);

          const transformedSports = transformMatches(
            data.data.sportsMatches,
            "sport",
          );
          setSportsMatches(transformedSports);
          setTotalSports(data.total.sportsMatches || transformedSports.length);

          setError(null);
        } else {
          setError(data.error || "Streaming error encountered");
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      } finally {
        setLoading(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource stream connection error:", err);
      eventSource.close();

      if (fallbackData) {
        setLiveMatches(fallbackData.liveMatches || []);
        setSportsMatches(fallbackData.sportsMatches || []);
        setTotalLive(fallbackData.liveMatches?.length || 0);
        setTotalSports(fallbackData.sportsMatches?.length || 0);
      } else {
        setError("Connection lost. Retrying live updates...");
      }
      setLoading(false);
    };

    // Cleanup connection on component unmount
    return () => {
      eventSource.close();
    };
  }, [fallbackData]);

  if (loading) {
    return (
      <div className="  ">
        {/* Live Section Loading */}
        <section className="w-full font-sans px-3 pt-3">
          <div className="flex items-center justify-between mb-1 px-1"></div>
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
                  <div className="h-10 bg-gray-200 rounded "></div>
                  <div className="h-10 bg-gray-200 rounded "></div>
                  <div className="h-10 bg-gray-200 rounded "></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sports Section Loading */}
        <section className="w-full font-sans px-3 pt-3 ">
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
                  <div className="h-10 bg-gray-200 rounded "></div>
                  <div className="h-10 bg-gray-200 rounded "></div>
                  <div className="h-10 bg-gray-200 rounded "></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error && liveMatches.length === 0 && sportsMatches.length === 0) {
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
      <LiveMatchSection
        liveTitle="LIVE"
        liveCount={totalLive}
        matches={liveMatches}
      />

      <LiveMatchSection
        liveTitle="SPORTS"
        liveCount={totalSports}
        matches={sportsMatches}
      />
    </div>
  );
};
