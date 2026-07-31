"use client";

import { useEffect } from "react";
import Header from "@/components/landing/headers/Header";
import TabBar from "@/components/landing/TabBar";
import { useOpenGame } from "@/store/useStore";
import { getSportsUrl } from "@/lib/helpers";
import { useSearchParams } from "next/navigation";

export default function GamePage() {
  const searchParams = useSearchParams();

  const { gameUrl, loading, error, fetchGame } = useOpenGame();
  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  const type = searchParams.get("type");
  const iframeUrl = getSportsUrl(
    gameUrl,
    type === "live" || type === "line" ? type : "",
  );

  console.log({ iframeUrl });

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* 1. Header sits naturally at the top without overlapping */}
      <Header />

      {/* 2. Main container takes up all remaining space between Header and TabBar */}
      <main className="flex-1 w-full relative">
        <iframe
          src={iframeUrl}
          className="w-full h-full border-0"
          allowFullScreen
          title="Game"
          allow="fullscreen, autoplay"
          referrerPolicy="origin"
        />
      </main>

      {/* 3. TabBar sits at the bottom */}
      <TabBar />
    </div>
  );
}
