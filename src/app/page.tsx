"use client";
import Footer from "@/components/landing/footer/Footer";
import Header from "@/components/landing/headers/Header";

import TabBar from "@/components/landing/TabBar";
import { SportsHeaderBar } from "@/components/category/category-filter";
import { DashboardWrapper } from "@/components/category/matches";
import HomeSlots from "@/components/casino/home-slots.games";
import HomeLive from "@/components/casino/home-live";
import FeaturesHighlight from "@/components/features-highlight";

export default function Home() {
  // const matchesData = [
  //   // 1. Cricket Match (Image 1)
  //   {
  //     id: "cricket-1",
  //     sportType: "cricket",
  //     statusText: "Event in progress",
  //     hasLiveStream: true,
  //     homeTeam: {
  //       name: "Lahore Qalandars",
  //       logoUrl:
  //         "https://crystalpng.com/wp-content/uploads/2025/04/lahore-qalandars-logo.png", // Paste your image link here
  //       score: "176/4",
  //     },
  //     awayTeam: {
  //       name: "Desert Vipers",
  //       logoUrl:
  //         "https://www.thedesertvipers.com/wp-content/uploads/2025/07/Desert_Vipers.png", // Paste your image link here
  //       score: "104/4",
  //       oversOrDetails: "(14.3)",
  //     },
  //     bettingOptions: [
  //       { id: "1", label: "W2", odds: 7.64 },
  //       { id: "2", label: "IT2 154.5 O", odds: 1.76 },
  //       { id: "3", label: "IT2 154.5 U", odds: 1.904 },
  //       { id: "4", label: "1", odds: 1.085 },
  //       { id: "5", label: "2", odds: 7.5 },
  //     ],
  //   },
  //   // 2. Football Match - Russia Premier League (Image 2 & 4)
  //   {
  //     id: "football-1",
  //     sportType: "football",
  //     statusText: "11:39 / 1st half",
  //     leagueName: "Russia. Premier League",
  //     roundName: "Round 1",
  //     hasLiveStream: true,
  //     homeTeam: {
  //       name: "CSKA Moscow",
  //       logoUrl:
  //         "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/1963.png",
  //       score: "0",
  //     },
  //     awayTeam: {
  //       name: "Baltika Kaliningrad",
  //       logoUrl:
  //         "https://toppng.com/uploads/preview/fk-baltika-kaliningrad-vector-logo-11574295607zvbdp2gbc6.png",
  //       score: "1",
  //     },
  //     bettingOptions: [
  //       { id: "1", label: "YES", odds: "—" },
  //       { id: "2", label: "BOTH TEAMS TO SCORE - NO", odds: 4.22 },
  //       { id: "3", label: "HANDICAP 1 (0)", odds: 2.44 },
  //     ],
  //   },
  //   // 3. Football Match - Club Friendly
  //   {
  //     id: "football-2",
  //     sportType: "football",
  //     statusText: "11:38 / 1st half",
  //     leagueName: "Club Friendly",
  //     hasLiveStream: false,
  //     homeTeam: {
  //       name: "Benfica",
  //       logoUrl:
  //         "https://upload.wikimedia.org/wikipedia/sco/thumb/a/a2/SL_Benfica_logo.svg/1280px-SL_Benfica_logo.svg.png",
  //       score: "0",
  //     },
  //     awayTeam: {
  //       name: "Os Belenenses",
  //       logoUrl:
  //         "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIXKqCaIrJc0ovDSsbMNQHjZlijO4MvSaJDEsEBugfdg&s=10",
  //       score: "0",
  //     },
  //     bettingOptions: [
  //       { id: "1", label: "W1", odds: 1.12 },
  //       { id: "2", label: "DRAW", odds: 6.5 },
  //       { id: "3", label: "W2", odds: 15.0 },
  //     ],
  //   },
  // ];
  return (
    <div className=" min-h-screen">
      <Header />
      <main className="container bg-gray-100">
        {/* <Hero /> */}
        <FeaturesHighlight />
        <SportsHeaderBar
          onFavoriteClick={() => console.log("Favorites clicked")}
          onSearchClick={() => console.log("Search clicked")}
        />
        <div className="">
          <DashboardWrapper />
        </div>

        <HomeSlots />
        <HomeLive />
        <Footer />
      </main>
      <TabBar />
    </div>
  );
}
