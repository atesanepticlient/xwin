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
    <>
      <Header />

      <iframe
        src={iframeUrl}
        className="fixed inset-0 h-screen w-screen border-0"
        allowFullScreen
        title="Game"
      />

      <TabBar />
    </>
  );
}
