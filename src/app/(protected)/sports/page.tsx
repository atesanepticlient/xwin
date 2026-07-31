"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/components/landing/headers/Header";
import TabBar from "@/components/landing/TabBar";
import { useOpenGame } from "@/store/useStore";
import { getSportsUrl } from "@/lib/helpers";
import { useSearchParams } from "next/navigation";

export default function GamePage() {
  const searchParams = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [needsCookiePermission, setNeedsCookiePermission] = useState(false);

  const { gameUrl, loading, error, fetchGame } = useOpenGame();

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  // Check if third-party cookies/storage are restricted on this device (iOS/Android)
  useEffect(() => {
    if (typeof document !== "undefined" && "hasStorageAccess" in document) {
      document.hasStorageAccess().then((hasAccess) => {
        if (!hasAccess) {
          setNeedsCookiePermission(true);
        }
      });
    }
  }, []);

  const handleGrantAccess = async () => {
    if (typeof document !== "undefined" && "requestStorageAccess" in document) {
      try {
        await document.requestStorageAccess();
        setNeedsCookiePermission(false);
        // Reload iframe to send stored cookies
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        }
      } catch (err) {
        console.error("Storage access permission denied:", err);
      }
    }
  };

  const type = searchParams.get("type");
  // Uses your EXACT original getSportsUrl logic outputting https://sportshub-custom001.network/...
  const iframeUrl = getSportsUrl(
    gameUrl,
    type === "live" || type === "line" ? type : "",
  );

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
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
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      <Header />

      <main className="flex-1 w-full relative min-h-0">
        {/* Mobile Safari/Chrome Cookie Overlay */}
        {needsCookiePermission && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-6 text-center text-white">
            <p className="mb-4 text-sm font-medium">
              Mobile browsers require permission to enable session cookies for
              the sports provider.
            </p>
            <button
              onClick={handleGrantAccess}
              className="px-5 py-2.5 bg-yellow-500 text-black font-semibold rounded-lg shadow hover:bg-yellow-400 transition"
            >
              Allow Cookies & Start Game
            </button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={iframeUrl}
          className="w-full h-full border-0 block"
          allowFullScreen
          title="Game"
          /* Crucial permissions for iOS Safari & Android Chrome */
          allow="fullscreen; autoplay; clipboard-write; encrypted-media; storage-access"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-storage-access-by-user-activation"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </main>

      {/* Target the wrapper specifically on this page so it occupies layout flow instead of floating over the iframe */}
      <div className="shrink-0 [&>div]:relative [&>div]:bottom-auto [&>div]:left-0 [&>div]:translate-x-0">
        <TabBar />
      </div>
    </div>
  );
}
