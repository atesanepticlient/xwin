"use client";

import React, { useEffect, useRef, useState } from "react";
import { useOpenGame } from "@/store/useStore";
import { getSportsUrl } from "@/lib/helpers";

interface SportsHomeProps {
  redirect?: string;
  className?: string;
}

const SportsHome = ({
  redirect = "/sports/live",
  className = "w-full",
}: SportsHomeProps) => {
  const { gameUrl, loading, error, fetchGame } = useOpenGame();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeHeight, setIframeHeight] = useState("100vh");

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  const iframeUrl = getSportsUrl(gameUrl, redirect);

  // Show the global loader until the API and iframe are ready.
  const isOpening =
    loading || (!gameUrl && !error) || (!!iframeUrl && !iframeLoaded);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      // Validate the expected third-party origin before trusting messages.
      if (typeof event.data?.height === "number" && event.data.height > 0) {
        setIframeHeight(`${event.data.height}px`);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  console.log({ iframeUrl });
  if (error) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center bg-[#EDF0F2]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Global opening loader */}
      {isOpening && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-5 text-lg font-semibold text-gray-800">Opening...</p>
        </div>
      )}

      {iframeUrl && (
        <div className={`${className} w-full`}>
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            onLoad={() => setIframeLoaded(true)}
            style={{ height: iframeHeight }}
            className="block w-full border-0"
            allowFullScreen
            title="Sports"
            allow="fullscreen; autoplay; clipboard-write; encrypted-media; storage-access"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-storage-access-by-user-activation"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </>
  );
};

export default SportsHome;
