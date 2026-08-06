"use client";
import Footer from "@/components/landing/footer/Footer";
import Header from "@/components/landing/headers/Header";

import TabBar from "@/components/landing/TabBar";
import { SportsHeaderBar } from "@/components/category/category-filter";
import HomeSlots from "@/components/casino/home-slots.games";
import HomeLive from "@/components/casino/home-live";
import FeaturesHighlight from "@/components/features-highlight";
import Intro from "./intro";
import AppBanner from "@/components/app-banner";
import { MobileHomePage } from "@/components/mobile";
import { SportsWrapper } from "@/components/category/matches";
import Slots from "./(game)/casino/slots";
import PopularLive from "./(game)/casino/popular-live";
import { useAppStore } from "@/lib/store.zustond";

export default function Home() {
  const { isMobileSubdomain } = useAppStore();
  return (
    <div className=" min-h-screen">
      {isMobileSubdomain ? (
        <MobileHomePage />
      ) : (
        <>
          <Header />
          <main className="container bg-gray-100 ">
            <FeaturesHighlight />
            <SportsHeaderBar
              onFavoriteClick={() => console.log("Favorites clicked")}
              onSearchClick={() => console.log("Search clicked")}
            />
            <div className="px-2">
              <SportsWrapper.TopLive />
              <SportsWrapper.PreMatch />
              <SportsWrapper.LiveTournaments />

              <Slots theme="light" maxRow={1} />
              <PopularLive theme="light" maxRow={1} />
            </div>


            <Footer />
          </main>
          <TabBar />
        </>
      )}
    </div>
  );
}
